import io
from typing import Dict, Any
import pandas as pd
import sqlite3

from google.adk.tools import ToolContext

from .config import TABLE_INFO_SESSION_KEY, TABLE_NAME, DB_PATH


def file_processor_tool(tool_context: ToolContext) -> Dict[str, str]:
    """
    Processes CSV files and stores them in a SQLite database.

    Returns:
        Dict[str, str]: A dictionary containing:
            - status: 'success' or 'error'
            - response: Descriptive message about the processing result
    """
    contents = tool_context.user_content
    df = None

    for part in contents.parts:
        if part.inline_data and part.inline_data.mime_type == "text/csv":
            try:
                binary_csv_data = part.inline_data.data
                decoded_data = binary_csv_data.decode('utf-8')
                string_buffer = io.StringIO(decoded_data)
                df = pd.read_csv(string_buffer)
            except Exception as e:
                return {
                    "status": "error",
                    "response": f"Failed to read CSV file: {str(e)}"
                }
    if df is None:
        return {
            "status": "error",
            "response": "Please provide a valid CSV file"
        }

    tool_context.state[TABLE_INFO_SESSION_KEY] =  f"Table name={TABLE_NAME}, columns info: {df.dtypes.to_string()}"

    try:
        conn = sqlite3.connect(DB_PATH)
        df.to_sql(
            name=TABLE_NAME,
            con=conn,
            if_exists='replace',
            index=False,
        )
        conn.close()
        return {
            "status": "success",
            "response": "File processed successfully. You can now ask analytical questions."
        }
    except Exception as e:
        return {
            "status": "error",
            "response": f"Failed to save data to SQLite: {str(e)}"
        }



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