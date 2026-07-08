import './Message.css'

export function Message({ title, message, action, btnLabel }) {
  return (
    <div className="message_body">
      <div className="message_card">
        <div className="message_icon">
          <svg viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="message_title">{ title }</h1>
        <p className="message_text">
          { message }
        </p>
        <button onClick={action} className="message_btn">{ btnLabel }</button>
      </div>
    </div>
  )
}