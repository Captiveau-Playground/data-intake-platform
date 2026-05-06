import psycopg2
import bcrypt
import os

# Default database URL
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://football_intel:football_intel_dev@localhost:5432/football_intel")

def seed_users():
    users_to_seed = [
        {"username": "admin", "password": "admin123", "role": "admin"},
        {"username": "user1", "password": "password123", "role": "user"},
    ]

    print(f"Connecting to database at {DATABASE_URL}...")
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()

        for user in users_to_seed:
            username = user["username"]
            password = user["password"]
            role = user["role"]
            
            # Generate hash
            password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            print(f"Seeding user: {username}...")
            cur.execute(
                "INSERT INTO users (username, password_hash, role) VALUES (%s, %s, %s) ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role",
                (username, password_hash, role)
            )

        conn.commit()
        cur.close()
        conn.close()
        print("Seeding completed successfully!")
    except Exception as e:
        print(f"Error during seeding: {e}")

if __name__ == "__main__":
    seed_users()
