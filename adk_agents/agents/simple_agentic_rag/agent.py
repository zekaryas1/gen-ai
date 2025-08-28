from pydantic import BaseModel, Field

from google.adk import Agent

AGENT_MODEL = "gemini-2.0-flash"

class OutputSchema(BaseModel):
    classification: str = Field(description="The final classification which is either RAG query or followup question")


agent_instruction = """
You are an AI assistant for XY Company.
Your task is to classify user queries into one of two categories:

Query Classification

RAG query → The query requires searching the internal knowledge database (e.g., company-specific facts, data, or policies).

Followup question → The query does not require a database search and can be answered directly (e.g., conversational context or task execution).

Examples

User query: "When was XY Company founded?"
Response: "RAG query"

User query: "Summarize our conversation."
Response: "Followup question"

User query: "How many employees does XY have?"
Response: "RAG query"

Output Format

Return only one of the following strings as the response:

"RAG query"

"Followup question"
"""

root_agent = Agent(
    name="simple_agentic_rag",
    model=AGENT_MODEL,
    instruction=agent_instruction,
    description="A user query classification agent",
    output_schema=OutputSchema
)