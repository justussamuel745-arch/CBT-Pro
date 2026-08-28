import { useState, memo, useEffect } from 'react';
import { MarkdownContent } from './MarkdownContent';
import { AIStore } from '../stores/AIStore';

export const AnswerCard = memo(function AnswerCard({ explanation, correctAnswers, ques, setChatWithAI }){
  const { onAskAI, setChatMessages, aiExplanations, setAiExplanations } = AIStore(state => state)
  const question = ques.question?.qs || ques.question
  const qsId = ques.id
  const [aiOpen, setAiOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [aiError, setAiError] = useState(null);
  const [showContinuePrompt, setShowContinuePrompt] = useState(false);
  const [promptDismissed, setPromptDismissed] = useState(false);
  
  
  useEffect(() => {
    aiExplanations.length !== 0 && aiExplanations.forEach((e) => {
      if (e.id === qsId){
        setAiResponse(e.explanation)
        if (e.show){
          setAiOpen(true)
        }
      }
    });
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])
  
  const handleAskAi = async () => {
    if (aiResponse) { 
      setAiOpen(o => !o);
      setAiExplanations(
        prev => (
          prev.map(e => e.id === qsId ? {...e, show: !e.show} : e)
        )
      )
      return; 
    }
    setAiOpen(true);
    setAiLoading(true);
    setAiError(null);
    try {
      const result = await onAskAI({ questionId: qsId, message: question });
      //const result = 'This is a test reply. \nWave is a disturbance which result to the transfer of energy '
      setAiResponse(result);
      setShowContinuePrompt(true);
      setChatMessages(prev => ([
        ...prev,
        {
          id: `${qsId}-user`,
          sender: 'user',
          message: question,
        }, {
          id: `${qsId}-ai`,
          sender: 'AI',
          message: result,
        }
      ]))
      setAiExplanations(prev => 
        (
          [
            ...prev,
            {
              id: qsId,
              explanation: result,
              show: true
            }
          ]
        )
      )
    } catch(err) {
      console.log(err);
      let errorText;
      if (!err.status){
        errorText = "Can't reach the server. Check your connection and try again."
      } else if (err.status >= 500){
        errorText = 'Something went wrong. Please try again.'
      } else if (err.status === 402) {
        errorText = 'You\'ve reached your AI credit limit. Please upgrade your plan or purchase additional credits to continue.'
      } else {
        errorText = err.error
      }
      setAiError(errorText);
    } finally {
      setAiLoading(false);
    }
  };
  
  

  const handleContinueInTab = () => {
    //setChatWithAI({ question, explanation, correctAnswers, priorResponse: aiResponse });
    setChatWithAI(true);
    setShowContinuePrompt(false);
  };
  
  if (question.trim().split(/\s+/).length > 30){
    return (
      <div className="mode-answer-section">
        <div className="mode-answer-header">Correct Answer</div>
        <div className="mode-answer-correct">Option {correctAnswers}</div>
        <div className="mode-answer-explanation">
          {/* Work on image */}
          <MarkdownContent>
            {explanation}
          </MarkdownContent>
        </div>
      </div>
    )
  }
  
  return (
    <div className="mode-answer-section">
      <div className="mode-answer-header">Correct Answer</div>
      <div className="mode-answer-correct">Option {correctAnswers.toUpperCase()}</div>
      <div className="mode-answer-explanation">
        <MarkdownContent>
          {explanation}
        </MarkdownContent>
      </div>

      <button className="mode-ai-trigger" onClick={handleAskAi} disabled={aiLoading}>
        <i className="fa-solid fa-wand-magic-sparkles"></i>
        <span>
          {aiResponse ? (aiOpen ? "Hide Astra's explanation" : "Show Astra's explanation") : "Still confused? Ask Astra"}
        </span>
      </button>

      {aiOpen && (
        <div className="mode-ai-panel">
          {aiLoading && (
            <div className="mode-ai-loading">
              <span className="mode-ai-dot"></span>
              <span className="mode-ai-dot"></span>
              <span className="mode-ai-dot"></span>
              <span className="mode-ai-loading-text">Astra is thinking...</span>
            </div>
          )}
          {aiError && (
            <div className="mode-ai-error">
              <i className="fa-solid fa-triangle-exclamation"></i> {aiError}
            </div>
          )}
          {aiResponse && !aiLoading && (
            <>
              <div className="mode-ai-response">
                <div className="mode-ai-response-header">
                  <i className="fa-solid fa-sparkles"></i> Astra&apos;s Approach
                </div>
                <span className="mode-ai-response-content">
                  <MarkdownContent>
                    {aiResponse}
                  </MarkdownContent>
                </span>
              </div>

              {showContinuePrompt && !promptDismissed && (
                <div className="mode-ai-continue">
                  <div className="mode-ai-continue-text">
                    <i className="fa-regular fa-comments"></i>
                    Still want to discuss this further?
                  </div>
                  <div className="mode-ai-continue-actions">
                    <button className="mode-ai-continue-btn primary" onClick={handleContinueInTab}>
                      <i className="fa-solid fa-arrow-up-right-from-square"></i>
                      Continue with Astra
                    </button>
                    <button
                      className="mode-ai-continue-btn ghost"
                      onClick={() => setPromptDismissed(true)}
                    >
                      No, I&apos;m good
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
});