// JavaScript Example: Reading Entities
// Filterable fields: title, topics, difficulty, total_questions, correct_answers, time_taken, score_percentage, completed_at
async function fetchQuizEntities() {
    const response = await fetch(`https://app.base44.com/api/apps/68a9b8961cb1d2e5d06464b7/entities/Quiz`, {
        headers: {
            'api_key': '782640df12bc45c5883f68bb90ea020d', // or use await User.me() to get the API key
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    console.log(data);
}

// JavaScript Example: Updating an Entity
// Filterable fields: title, topics, difficulty, total_questions, correct_answers, time_taken, score_percentage, completed_at
async function updateQuizEntity(entityId, updateData) {
    const response = await fetch(`https://app.base44.com/api/apps/68a9b8961cb1d2e5d06464b7/entities/Quiz/${entityId}`, {
        method: 'PUT',
        headers: {
            'api_key': '782640df12bc45c5883f68bb90ea020d', // or use await User.me() to get the API key
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
    });
    const data = await response.json();
    console.log(data);
}