from google.adk import Agent

from ..config import AGENT_MODEL
from ..tools import run_query

sql_to_message_agent = Agent(
    model=AGENT_MODEL,
    name="sql_to_message_agent",
    instruction="""
Convert SQL query results into human-readable responses.

Requirements:
- Use the `run_query` tool to execute the SQL query from the state under key `sql_query`
- Format results in a clear, user-friendly manner
- Use tables, lists, or descriptive text as appropriate
- Handle empty results gracefully
- Include relevant context from the query in the response

Output:
- A human-readable string containing the formatted results
""",
    description="Converts SQL query results into user-friendly messages",
    tools=[run_query]
)

