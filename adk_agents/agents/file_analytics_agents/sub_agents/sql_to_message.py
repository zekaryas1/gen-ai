import sqlite3
from typing import Dict, Any

from google.adk import Agent

from ..config import AGENT_MODEL

def run_query(sql: str) -> Dict[str, Any]:
    """
    Executes a SQL query on the local SQLite database.

    Args:
        sql (str): The SQL query to execute.

    Returns:
        Dict[str, Any]: A dictionary containing:
            - status: 'success' or 'error'
            - result: Query results or error message
    """
    try:
        conn = sqlite3.connect("local.db")
        cursor = conn.cursor()
        cursor.execute(sql)
        results = cursor.fetchall()
        conn.close()

        return {
            "status": "success",
            "result": results if results else "No results found"
        }
    except sqlite3.Error as e:
        return {
            "status": "error",
            "result": f"Query execution failed: {str(e)}"
        }


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



