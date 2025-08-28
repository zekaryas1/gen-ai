from pydantic import BaseModel, Field

from google.adk import Agent

AGENT_MODEL = "gemini-2.0-flash"


class OutputSchema(BaseModel):
    tables: list[str] = Field(description="Relevant tables")
    columns: list[str] = Field(description="Relevant columns")
    query: str = Field(description="SQL query based on user's request")

root_agent = Agent(
    name="simple_query_analyzer_agent",
    model=AGENT_MODEL,
    instruction="""
        You are an AI assistant that generates structured output for SQL queries.
        Given the database schema below, your task is to identify the relevant tables, columns, and construct the correct SQL query based on a user’s request.

        Database Schema
            Users(id, name, country)
            Posts(id, title, body, user_id)

        Examples
            User query: "how many users there are"
                Output (JSON):
                {
                  "tables": ["users"],
                  "columns": ["id"],
                  "query": "select count(id) from users"
                }

            User query: "every name in the table"
                Output (JSON):
                {
                  "tables": ["users"],
                  "columns": ["name"],
                  "query": "select name from users"
                }

            User query: "every user's post"
                Output (JSON):
                {
                  "tables": ["users", "posts"],
                  "columns": ["name", "title", "body"],
                  "query": "select name, title, body from users u join posts p on u.id = p.user_id"
                }

        Output Format
            You must output only a JSON object in the following format:
            {
              "tables": string[],
              "columns": string[],
              "query": string
            }
""",
    description="User database query analyzer and deconstruction agent.",
    output_schema=OutputSchema
)