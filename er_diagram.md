# Entity Relationship (ER) Diagram

## Visual Diagram (Mermaid.js)

```mermaid
erDiagram
    %% Core Entities
    USERS ||--o{ EMPLOYEE_ROLES : "assigned to"
    USERS ||--o{ SKILL_ASSESSMENTS : "performs"
    USERS ||--o{ LEARNING_PATHS : "follows"
    USERS ||--o{ TEST_ATTEMPTS : "takes"
    USERS ||--o{ PROMOTION_REQUESTS : "requests"
    USERS ||--o{ PROMOTION_REQUESTS : "reviews"

    JOB_ROLES ||--o{ ROLE_SKILLS : "requires"
    JOB_ROLES ||--o{ EMPLOYEE_ROLES : "defined as"
    JOB_ROLES ||--o{ LEARNING_PATHS : "associated with"
    JOB_ROLES ||--o{ TEST_ATTEMPTS : "related to"
    JOB_ROLES ||--o{ PROMOTION_REQUESTS : "current role"
    JOB_ROLES ||--o{ PROMOTION_REQUESTS : "target role"

    SKILLS ||--o{ ROLE_SKILLS : "part of"
    SKILLS ||--o{ SKILL_ASSESSMENTS : "assessed on"
    SKILLS ||--o{ LEARNING_PATHS : "teaches"
    SKILLS ||--o{ QUESTIONS : "has"

    QUESTIONS ||--o{ QUESTION_OPTIONS : "contains"

    %% Entity Definitions
    USERS {
        uuid id PK
        text email
        text full_name
        text role "admin | employee"
        timestamp created_at
    }

    JOB_ROLES {
        uuid id PK
        text title
        text description
        text level "junior | mid | senior..."
        timestamp created_at
    }

    SKILLS {
        uuid id PK
        text name
        text category "technical | soft"
        timestamp created_at
    }

    ROLE_SKILLS {
        uuid id PK
        uuid role_id FK
        uuid skill_id FK
        integer required_level
    }

    EMPLOYEE_ROLES {
        uuid id PK
        uuid user_id FK
        uuid role_id FK
        uuid assigned_by FK
        timestamp assigned_at
        text status "active | completed"
    }

    SKILL_ASSESSMENTS {
        uuid id PK
        uuid user_id FK
        uuid role_id FK
        uuid skill_id FK
        integer self_rating
        timestamp created_at
    }

    LEARNING_PATHS {
        uuid id PK
        uuid user_id FK
        uuid role_id FK
        uuid skill_id FK
        text resource_title
        text resource_url
        boolean completed
        timestamp created_at
    }

    TEST_ATTEMPTS {
        uuid id PK
        uuid user_id FK
        uuid role_id FK
        integer score
        boolean passed
        timestamp attempt_date
    }

    PROMOTION_REQUESTS {
        uuid id PK
        uuid user_id FK
        uuid current_role_id FK
        uuid requested_role_id FK
        text status "pending | approved | rejected"
        timestamp requested_at
        uuid reviewed_by FK
        timestamp reviewed_at
    }

    QUESTIONS {
        uuid id PK
        uuid skill_id FK
        text question_text
        text difficulty "easy | medium | hard"
        timestamp created_at
    }

    QUESTION_OPTIONS {
        uuid id PK
        uuid question_id FK
        text option_text
        boolean is_correct
        timestamp created_at
    }
```

## Entities & Attributes

### 1. USERS
*Represents all system users (Employees and Admins).*
- **id** (PK, UUID): Unique identifier.
- **email** (Text): User's email address.
- **full_name** (Text): User's full name.
- **role** (Text): System role ('admin' or 'employee').
- **created_at** (Timestamp): Account creation time.

### 2. JOB_ROLES
*Defines the various roles within the organization (e.g., Junior Developer, Senior Manager).*
- **id** (PK, UUID): Unique identifier.
- **title** (Text): Job title.
- **description** (Text): Description of responsibilities.
- **level** (Text): Seniority level (junior, mid, senior, etc.).
- **created_at** (Timestamp): Record creation time.

### 3. SKILLS
*Library of competencies required for roles.*
- **id** (PK, UUID): Unique identifier.
- **name** (Text): Name of the skill (e.g., React, Leadership).
- **category** (Text): Type of skill (technical or soft).
- **created_at** (Timestamp): Record creation time.

### 4. ROLE_SKILLS (Junction Table)
*Maps skills to job roles with required proficiency levels.*
- **id** (PK, UUID): Unique identifier.
- **role_id** (FK): Reference to Job Role.
- **skill_id** (FK): Reference to Skill.
- **required_level** (Integer): Level required (1-5).

### 5. EMPLOYEE_ROLES
*Tracks which user is assigned to which role.*
- **id** (PK, UUID): Unique identifier.
- **user_id** (FK): The employee.
- **role_id** (FK): The assigned role.
- **assigned_by** (FK): Admin who assigned the role.
- **status** (Text): Status of assignment (active, completed).

### 6. SKILL_ASSESSMENTS
*Self-evaluations performed by employees.*
- **id** (PK, UUID): Unique identifier.
- **user_id** (FK): The employee.
- **role_id** (FK): Contextual role.
- **skill_id** (FK): Skill being assessed.
- **self_rating** (Integer): Rating (1-5).

### 7. LEARNING_PATHS
*Educational resources assigned to bridge skill gaps.*
- **id** (PK, UUID): Unique identifier.
- **user_id** (FK): The employee.
- **role_id** (FK): Related role.
- **skill_id** (FK): Related skill.
- **resource_title** (Text): Title of the learning material.
- **resource_url** (Text): Link to the material.
- **completed** (Boolean): Completion status.

### 8. TEST_ATTEMPTS
*Records of skill verification tests taken by employees.*
- **id** (PK, UUID): Unique identifier.
- **user_id** (FK): The employee.
- **role_id** (FK): Related role.
- **score** (Integer): Test score.
- **passed** (Boolean): Pass/Fail status.
- **attempt_date** (Timestamp): Date of test.

### 9. PROMOTION_REQUESTS
*Formal requests for role advancement.*
- **id** (PK, UUID): Unique identifier.
- **user_id** (FK): The applicant.
- **current_role_id** (FK): Current position.
- **requested_role_id** (FK): Desired position.
- **status** (Text): Request status.
- **reviewed_by** (FK): Admin reviewer.

### 10. QUESTIONS
*Question bank for skill tests.*
- **id** (PK, UUID): Unique identifier.
- **skill_id** (FK): Skill this question tests.
- **question_text** (Text): The question content.
- **difficulty** (Text): Difficulty level.

### 11. QUESTION_OPTIONS
*Multiple-choice options for questions.*
- **id** (PK, UUID): Unique identifier.
- **question_id** (FK): Parent question.
- **option_text** (Text): The option content.
- **is_correct** (Boolean): Correct answer flag.

## Shapes & Placement Guide

If you are drawing this manually or using a tool like Lucidchart/Draw.io:

### Shapes
- **Entities (Tables):** Use **Rectangles**. The top section should contain the Entity Name (e.g., USERS), and the bottom section should list the Attributes (e.g., id, email).
- **Relationships:** Use **Diamonds** if you want to strictly follow Chen's notation, but for modern Crow's Foot notation (recommended for database design), simply use **Lines** connecting the rectangles.
- **Attributes:** If using Chen's notation, use **Ovals** connected to the entity rectangle. For standard ERD, list them inside the entity rectangle.

### Placement & Layout
1.  **Central Hub:** Place **USERS** and **JOB_ROLES** in the center. These are the core entities that most others connect to.
2.  **Left Wing (Configuration):** Place **SKILLS** and **ROLE_SKILLS** to the left of Job Roles. This defines the static requirements of the system.
3.  **Right Wing (Activity):** Place **EMPLOYEE_ROLES**, **SKILL_ASSESSMENTS**, **LEARNING_PATHS**, and **TEST_ATTEMPTS** to the right of Users. These represent the dynamic data generated by user activity.
4.  **Bottom Section (Process):** Place **PROMOTION_REQUESTS** below Users and Job Roles, as it links the two in a workflow.
5.  **Far Left/Bottom (Content):** Place **QUESTIONS** and **QUESTION_OPTIONS** near Skills, as they are the content library supporting the skills.

### Connectors (Crow's Foot Notation)
- **One-to-Many (1:N):** Use a line with a single dash `|` on the "One" side and a crow's foot `<` on the "Many" side.
    - *Example:* One **USER** has many **TEST_ATTEMPTS**.
- **Many-to-Many (M:N):** These are resolved via junction tables (like **ROLE_SKILLS**).
    - *Example:* **JOB_ROLES** `||--o{` **ROLE_SKILLS** `}o--||` **SKILLS**.
