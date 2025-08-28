import datetime
from dataclasses import dataclass
from typing import TypedDict, Literal, Optional, Dict

from google.adk import Agent

AGENT_MODEL = "gemini-2.0-flash"

class ToolResponse(TypedDict):
    status: Literal["successful", "failed"]
    report: str | dict

@dataclass
class Todo:
    title: str
    status: Literal["pending", "done", "canceled"]
    planned_date: datetime.datetime


todos_dictionary: Dict[str, Todo] = {}
current_date = datetime.datetime.now()


def _parse_date(planned_date: Optional[dict]) -> Optional[datetime.datetime]:
    """Helper function to parse and validate date input."""
    if not planned_date:
        return None
    try:
        year, month, day = planned_date["year"], planned_date["month"], planned_date["day"]
        if not (1 <= month <= 12):
            raise ValueError("Month must be between 1 and 12")
        if not (1 <= day <= 31):  # Simplified; could add month-specific day validation
            raise ValueError("Day must be between 1 and 31")
        return datetime.datetime(year, month, day)
    except (KeyError, ValueError, TypeError) as e:
        raise ValueError(f"Invalid date format: {str(e)}")


def create_todo_tool(title: str, planned_date: dict) -> ToolResponse:
    """
    Create a new todo.

    Args:
        title: The title for the todo (required, non-empty string).
        planned_date: The planned date as a dictionary {year: int, month: int, day: int}.
                     Defaults to current date if not provided.

    Returns:
        A dictionary with 'status' ('successful' or 'failed') and 'report' (error message or todo details).
    """
    if not title or not title.strip():
        return {"status": "failed", "report": "Title is required and cannot be empty"}

    if title in todos_dictionary:
        return {"status": "failed", "report": "Todo already exists"}

    try:
        todo_date = _parse_date(planned_date) or datetime.datetime.now()
        todos_dictionary[title] = Todo(
            title=title,
            status="pending",
            planned_date=todo_date
        )
        return {
            "status": "successful",
            "report": {
                "title": title,
                "status": "pending",
                "planned_date": todo_date.isoformat()
            }
        }
    except ValueError as e:
        return {"status": "failed", "report": str(e)}


def update_todo_tool(
        title: str,
        status: Literal["pending", "done", "canceled"],
        planned_date: dict
) -> ToolResponse:
    """
    Update an existing todo's status or planned date.

    Args:
        title: The title of the todo to update (required).
        status: The new status ('pending', 'done', 'canceled'). Optional.
        planned_date: The new planned date as {year: int, month: int, day: int}. Optional.

    Returns:
        A dictionary with 'status' ('successful' or 'failed') and 'report' (error message or updated todo).
    """
    if title not in todos_dictionary:
        return {"status": "failed", "report": "Todo does not exist"}

    if not status and not planned_date:
        return {
            "status": "failed",
            "report": "At least one of status or planned_date must be provided"
        }

    try:
        current_todo = todos_dictionary[title]
        new_status = status if status else current_todo.status
        if status and status not in {"pending", "done", "canceled"}:
            return {"status": "failed", "report": "Status must be one of: pending, done, canceled"}

        new_date = _parse_date(planned_date) or current_todo.planned_date
        todos_dictionary[title] = Todo(
            title=title,
            status=new_status,
            planned_date=new_date
        )
        return {
            "status": "successful",
            "report": {
                "title": title,
                "status": new_status,
                "planned_date": new_date.isoformat()
            }
        }
    except ValueError as e:
        print(e)
        return {"status": "failed", "report": str(e)}


def read_all_todo_tool() -> ToolResponse:
    """
    Retrieve all todos.

    Returns:
        A dictionary with 'status' ('successful') and 'report' (dictionary of all todos).
    """
    return {
        "status": "successful",
        "report": {
            title: {
                "title": todo.title,
                "status": todo.status,
                "planned_date": todo.planned_date.isoformat()
            }
            for title, todo in todos_dictionary.items()
        }
    }


root_agent = Agent(
    name="todo_assistance_agent",
    model=AGENT_MODEL,
    instruction=f"""
        You are a Todo Assistant Agent that helps users manage their todos.
        You can create, update, and read todos by using the appropriate tools and responding in a clear format.
        
        Todo Schema
            Todo:
                title: string (required)
                status: one of pending | done | canceled
                planned_date: {{ year, month, day }}
        
        Tasks & Tools
            1. Create Todo
                Use create_todo_tool to create a todo.
                Extract from the user query:
                    title (required → if missing, ask user to provide one).
                    planned_date (if not specified, use the current date).
            2. Update Todo
                Use update_todo_tool to update either or both of:
                    status
                    planned_date
                Requirements:
                    title is required.
                    At least one of status or planned_date must be provided.
                If the exact title is unclear:
                    First, call read_all_todo_tool to list existing todos.
                    Try to identify the intended todo.
                    If no matching todo is found, inform the user.
            3. Read All Todos
                Use read_all_todo_tool to fetch all todos.
                The tool returns JSON/dictionary format.
                Transform the response into a human-readable format for the user.
            
            
        Examples
            User query: "Create a todo to go to the library tomorrow"
                Extracted data:
                    title: "go to the library"
                    planned_date: current_date + 1
                Tool: create_todo_tool with extracted data
        
            User query: "Move going to the library to next week"
                This is an update request (changing planned_date).
                Steps:
                    Call read_all_todo_tool
                    Identify the correct todo
                    Call update_todo_tool with title and new planned_date
           
            User query: "I have gone to the library"
                This is a status update (done).
                Steps:
                    Call read_all_todo_tool
                    Identify the correct todo
                    Call update_todo_tool with title and status = "done"
        
        Date Handling
            Current date is:
                {{"year": {current_date.year}, "month": {current_date.month}, "day": {current_date.day} }}
            Planned date format to use:
                Always pass in JSON format: {{"year": YYYY, "month": MM, "day": DD }}
                
        Output Format
            Use formatting (lists, bullets, bold text) for better readability.
            Always reply in clear, natural language that feels conversational.
            Dates should always be shown in a readable, human format:
                Example: "Aug 27, 2025" instead of "2025-08-27"
            Relative dates can also be expressed naturally (e.g., "tomorrow", "next Monday"), but include the exact calendar date for clarity.
                
""",
    description="A todo agent able to create and manage todos",
    tools=[
        create_todo_tool,
        update_todo_tool,
        read_all_todo_tool
    ]
)
