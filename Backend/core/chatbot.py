from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from langchain_classic.chains import ConversationalRetrievalChain
from langchain_core.prompts import PromptTemplate
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from core.prompts.templates import CHATBOT_PROMPT
from utils.vector_store import get_retriever
from typing import List, Dict, Optional
from config import (
    GEMINI_API_KEY, 
    GEMINI_MODEL_NAME, 
    GEMINI_TEMPERATURE,
    GROQ_API_KEY,
    GROQ_MODEL_NAME,
    GROQ_TEMPERATURE
)

chatbot_prompt_template = PromptTemplate.from_template(
    template=CHATBOT_PROMPT
)

# System prompt for direct context-based chat
DIRECT_CHAT_SYSTEM_PROMPT = """You are an AI assistant specialized in analyzing call summaries and transcripts.
Your role is to help users understand their call data by answering questions based on the provided context.

Instructions:
- Provide clear, concise answers based on the context provided
- When multiple calls are available, pay attention to which call the user is asking about
- If a specific call is marked as "CURRENTLY SELECTED CALL", prioritize information from that call
- If the user's question is ambiguous about which call they're referring to, politely ask for clarification
- Reference specific calls by their filename or timestamp when relevant
- Be helpful and professional in your responses
- If asked about summaries, key points, or sentiments, extract that information from the context
- When listing information from multiple calls, clearly indicate which call each piece of information comes from
- If the context doesn't contain relevant information, politely say so
- IMPORTANT: If you see "[File: recording-*.webm]" or similar in the user's message, this is a voice message that has already been transcribed. The text BEFORE the file reference is what the user actually said. Respond to their spoken question, not about the file itself.
- Never say you cannot process files or attachments - all voice recordings are automatically transcribed for you
- Focus on answering the user's actual question based on the call data context provided

{user_context}"""

def create_chatbot_llm(model_choice: str = "gemini"):
    if model_choice.lower() == "groq":
        return ChatGroq(
            model=GROQ_MODEL_NAME,
            api_key=GROQ_API_KEY,
            temperature=GROQ_TEMPERATURE
        )
    else:
        return ChatGoogleGenerativeAI(
            model=GEMINI_MODEL_NAME,
            api_key=GEMINI_API_KEY,
            temperature=GEMINI_TEMPERATURE
        )


def create_chatbot_chain(model_choice: str = "groq"):
    llm = create_chatbot_llm(model_choice)
    retriever = get_retriever()
    chain = ConversationalRetrievalChain.from_llm(
        llm=llm,
        retriever=retriever,
        return_source_documents=True,
        combine_docs_chain_kwargs={"prompt": chatbot_prompt_template},
        verbose=False
    )
    
    return chain


def process_query_with_context(
    question: str,
    user_context: str,
    chat_history: Optional[List[Dict[str, str]]] = None,
    model_choice: str = "gemini"
) -> Dict[str, any]:
    """
    Process a query using direct LLM call with user-provided context.
    This bypasses the vector store and uses the user's actual data from Supabase.
    """
    try:
        llm = create_chatbot_llm(model_choice)
        
        # Build messages list
        messages = []
        
        # Add system message with user context
        system_prompt = DIRECT_CHAT_SYSTEM_PROMPT.format(user_context=user_context)
        messages.append(SystemMessage(content=system_prompt))
        
        # Add chat history
        if chat_history:
            for msg in chat_history:
                if msg["role"] == "user":
                    messages.append(HumanMessage(content=msg["content"]))
                elif msg["role"] == "assistant":
                    messages.append(AIMessage(content=msg["content"]))
        
        # Add current question
        messages.append(HumanMessage(content=question))
        
        # Get response from LLM
        response = llm.invoke(messages)
        
        return {
            "answer": response.content,
            "sources": [],  # No vector store sources when using direct context
            "model_used": model_choice
        }
        
    except Exception as e:
        raise


def process_query(
    question: str,
    chat_history: Optional[List[Dict[str, str]]] = None,
    model_choice: str = "gemini"
) -> Dict[str, any]:
    try:
        chain = create_chatbot_chain(model_choice)
        formatted_history = []
        if chat_history:
            for msg in chat_history:
                if msg["role"] == "user":
                    formatted_history.append(("human", msg["content"]))
                elif msg["role"] == "assistant":
                    formatted_history.append(("ai", msg["content"]))
        result = chain({
            "question": question,
            "chat_history": formatted_history
        })
        sources = []
        if "source_documents" in result:
            for doc in result["source_documents"]:
                sources.append({
                    "content": doc.page_content,
                    "metadata": doc.metadata if hasattr(doc, 'metadata') else {}
                })
        
        return {
            "answer": result["answer"],
            "sources": sources,
            "model_used": model_choice
        }
        
    except Exception as e:
        raise


def query_without_history(question: str, model_choice: str = "gemini") -> Dict[str, any]:
    return process_query(question, chat_history=None, model_choice=model_choice)