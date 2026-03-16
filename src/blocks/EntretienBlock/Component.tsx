"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Send, Bot } from "lucide-react"

const WEBHOOK =
"http://localhost:5678/webhook/efb39f42-5792-4fa5-9490-fefb6a4d2d81/chat"

export default function EntretienBlockComponent({ title }) {

const [message,setMessage] = useState("")
const [messages,setMessages] = useState([])
const [report,setReport] = useState(null)
const [typing,setTyping] = useState(false)

const sessionId = useRef("user-"+Math.random().toString(36).substring(7))
const bottomRef = useRef(null)

useEffect(()=>{
bottomRef.current?.scrollIntoView({behavior:"smooth"})
},[messages,typing])

const sendMessage = async () => {

if (!message.trim() || typing) return

const userMsg = message

setMessages(prev => [
  ...prev,
  { role: "user", content: userMsg }
])

setMessage("")
setTyping(true)

try {

const res = await fetch(WEBHOOK, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    action: "sendMessage",
    sessionId: sessionId.current,
    chatInput: userMsg
  })
})

const data = await res.json()

console.log("N8N RESPONSE:", data)

const aiResponse =
  data.output ||
  data.response ||
  data.message ||
  data.text ||
  null

if (aiResponse) {
  setMessages(prev => [
    ...prev,
    { role: "ai", content: aiResponse.replace("[FIN]", "") }
  ])
}

if (data.fileName) {
  setReport(data)
}

} catch (error) {

console.error("Erreur webhook:", error)

setMessages(prev => [
  ...prev,
  { role: "ai", content: "Erreur de connexion avec le serveur." }
])

} finally {

setTyping(false)

}

}
return (

<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 via-purple-100 to-blue-200 p-10">

<div className="grid grid-cols-2 gap-10 max-w-7xl w-full">

{/* ================= CHAT ================= */}

<div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-xl flex flex-col">

<div className="flex items-center gap-2 mb-4">

<span className="text-purple-600 text-2xl">🧠</span>

<h2 className="text-purple-700 font-semibold">
Entretien de personnalité
</h2>

</div>

<h1 className="text-2xl font-bold mb-1">
Entretien de personnalité
</h1>

{/* ================= MESSAGES ================= */}

<div className="flex-1 overflow-y-auto mb-6 space-y-6 max-h-[420px]">

{messages.map((msg,i)=>{

if(msg.role === "ai"){

return(

<div key={i} className="flex items-start gap-3">

<div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
<Bot className="w-5 h-5 text-purple-600"/>
</div>

<div className="bg-white rounded-2xl shadow px-4 py-3 max-w-lg text-gray-700 text-sm leading-relaxed">

{msg.content}

</div>

</div>

)

}

return(

<div key={i} className="flex justify-end">

<div className="bg-gradient-to-r from-purple-600 to-purple-500 text-white px-4 py-3 rounded-xl max-w-sm text-sm shadow">

{msg.content}

</div>

</div>

)

})}

{typing && (

<div className="flex items-center gap-3">

<div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
<Bot className="w-5 h-5 text-purple-600"/>
</div>

<div className="bg-white px-4 py-3 rounded-xl shadow text-sm text-gray-500 animate-pulse">

Psychologue IA écrit...

</div>

</div>

)}

<div ref={bottomRef}></div>

</div>

{/* ================= LABEL IA ================= */}

<div className="flex items-center gap-2 mb-3">

<div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
<Bot className="w-3 h-3 text-purple-600"/>
</div>

<span className="text-sm text-purple-600">
Psychologue IA
</span>

</div>

{/* ================= INPUT ================= */}

<div className="flex items-center bg-white rounded-full shadow px-4 py-2">

<input
value={message}
onChange={(e)=>setMessage(e.target.value)}
onKeyDown={(e)=>{
if (e.key === "Enter" && !typing) {
e.preventDefault()
sendMessage()
}
}}
placeholder="Écrivez votre réponse..."
className="flex-1 outline-none text-gray-800 placeholder-gray-400"
/>

<Button
onClick={sendMessage}
size="icon"
disabled={typing}
className="rounded-full bg-purple-600 hover:bg-purple-700 ml-2"

>

<Send className="w-4 h-4 text-white"/>

</Button>

</div>

<p className="text-xs text-gray-500 mt-3">
✨ Analyse générée par IA pour personnaliser votre accompagnement
</p>

</div>

{/* ================= RAPPORT ================= */}

<div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-xl">

<div className="flex items-center gap-3 mb-6">

<div className="bg-purple-100 w-10 h-10 rounded-lg flex items-center justify-center">
📄
</div>

<h2 className="text-purple-700 font-semibold">
Rapport de personnalité
</h2>

</div>

{!report && (

<p className="text-gray-600">
Le rapport sera généré automatiquement après la fin de l'entretien.
</p>

)}

{report && (

<a
href={`data:${report.mimeType};base64,${report.binary.data}`}
download={report.fileName}
className="bg-purple-600 text-white px-6 py-3 rounded-xl inline-block"

>

Télécharger le rapport PDF

</a>

)}

</div>

</div>

</div>

)

}
