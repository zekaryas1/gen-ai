from typing import Optional

from google.adk.agents import SequentialAgent
from google.adk.agents.callback_context import CallbackContext
from google.genai import types

from ..config import TABLE_INFO_SESSION_KEY
from .question_to_sql import question_to_sql_agent
from .sql_to_message import sql_to_message_agent


def check_required_sessions(callback_context: CallbackContext) -> Optional[types.Content]:
    """
    Checks if required session data (table information) exists before processing queries.

    Args:
        callback_context (CallbackContext): The context containing the current state.

    Returns:
        Optional[Content]: Returns a Content object with an error message if table info is missing,
                         None otherwise.
    """
    current_state = callback_context.state.to_dict()
    if current_state.get(TABLE_INFO_SESSION_KEY, None) is None:
        return types.Content(
            parts=[types.Part(text="No processed CSV files found. Please upload a CSV file first.")],
            role="model"
        )
    return None

query_handler_agent = SequentialAgent(
    name="query_handler_agent",
    description="Handles user queries by converting them to SQL and formatting results",
    sub_agents=[
        question_to_sql_agent,
        sql_to_message_agent
    ],
    before_agent_callback=check_required_sessions
)