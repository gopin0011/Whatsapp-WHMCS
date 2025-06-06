import mysql.connector

host_db = '127.0.0.1'
name_db = ''
user_db = 'root'
pass_db = 'Passwd2025'

db = mysql.connector.connect(
  host = host_db,
  user = user_db,
  password = pass_db,
  database = name_db
)
