import os
import sqlite3
from typing import List, Dict, Any, Optional, Tuple


class DatabaseAccess:
    """
    Provides access to the SQLite database for the time tracking application.
    """

    def __init__(self, db_path: Optional[str] = None):
        """
        Initialize the database access with the specified database path.

        Args:
            db_path: Optional path to the SQLite database file.
                    If not provided, defaults to '../../data/timetracker.db'
        """
        if db_path is None:
            # Get the directory of the current file
            current_dir = os.path.dirname(os.path.abspath(__file__))
            # Navigate up to the agent package, then up to packages, then to data folder
            db_path = os.path.normpath(os.path.join(
                current_dir, "../../..", "data", "timetracker.db"))

        self.db_path = db_path

    def _get_connection(self) -> sqlite3.Connection:
        """
        Gets a connection to the SQLite database.

        Returns:
            An SQLite connection object.

        Raises:
            sqlite3.Error: If the connection cannot be established.
        """
        try:
            conn = sqlite3.connect(self.db_path)
            # Enable dictionary access to rows
            conn.row_factory = sqlite3.Row
            return conn
        except sqlite3.Error as e:
            raise Exception(f"Database connection error: {str(e)}")

    def get_schema(self) -> Dict[str, List[Dict[str, str]]]:
        """
        Gets the schema of the database.

        Returns:
            A dictionary where keys are table names and values are lists of columns
            with their names and types.
        """
        schema = {}

        try:
            conn = self._get_connection()
            cursor = conn.cursor()

            # Get all tables in the database
            cursor.execute(
                "SELECT name FROM sqlite_master WHERE type='table';")
            tables = [row[0] for row in cursor.fetchall()]

            # Get column information for each table
            for table in tables:
                cursor.execute(f"PRAGMA table_info({table});")
                columns = []
                for col in cursor.fetchall():
                    columns.append({
                        "name": col["name"],
                        "type": col["type"],
                        "is_primary_key": bool(col["pk"]),
                        "is_nullable": not bool(col["notnull"])
                    })
                schema[table] = columns

            conn.close()
            return schema

        except sqlite3.Error as e:
            raise Exception(f"Error getting schema: {str(e)}")

    def execute_query(self, query: str, params: Optional[Tuple] = None) -> List[Dict[str, Any]]:
        """
        Executes a SQL query against the database.

        Args:
            query: The SQL query to execute.
            params: Optional tuple of parameters to bind to the query.

        Returns:
            A list of dictionaries representing the rows returned by the query.

        Raises:
            Exception: If there's an error executing the query.
        """
        try:
            conn = self._get_connection()
            cursor = conn.cursor()

            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)

            # Convert the results to a list of dictionaries
            results = [dict(row) for row in cursor.fetchall()]
            conn.close()

            return results

        except sqlite3.Error as e:
            raise Exception(f"Query execution error: {str(e)}")

    def execute_write_query(self, query: str, params: Optional[Tuple] = None) -> int:
        """
        Executes a SQL query that modifies data (INSERT, UPDATE, DELETE).

        Args:
            query: The SQL query to execute.
            params: Optional tuple of parameters to bind to the query.

        Returns:
            The number of rows affected.

        Raises:
            Exception: If there's an error executing the query.
        """
        try:
            conn = self._get_connection()
            cursor = conn.cursor()

            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)

            # Commit the transaction
            conn.commit()

            # Get the number of rows affected
            rows_affected = cursor.rowcount
            conn.close()

            return rows_affected

        except sqlite3.Error as e:
            raise Exception(f"Write query execution error: {str(e)}")
