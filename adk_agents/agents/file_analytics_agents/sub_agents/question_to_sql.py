from google.adk import Agent

from ..config import AGENT_MODEL, TABLE_INFO_SESSION_KEY

question_to_sql_agent = Agent(
    model=AGENT_MODEL,
    name="question_to_sql_agent",
    instruction=f"""
Convert natural language requests into SQLite-compatible SQL queries.

Input:
- Natural language query from the user
- Table information stored in state under key: {{{TABLE_INFO_SESSION_KEY}}}

Requirements:
- Generate precise, executable SQLite queries
- Use table and column information from the state key {{{TABLE_INFO_SESSION_KEY}}}
- Return only the final SQL query string
- If conversion fails, return a clear error message describing the issue
- Ensure queries are safe and optimized for SQLite

Output:
- A single SQLite-compatible SQL query string
- Or an error message if the query cannot be generated
""",
    description="Converts user questions into SQLite-compatible SQL queries",
    output_key="sql_query",
)