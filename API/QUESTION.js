// JavaScript Example: Reading Entities
// Filterable fields: quiz_id, question_text, question_type, options, correct_answer, user_answer, is_correct, explanation, topic, difficulty
async function fetchQuestionEntities() {
    const response = await fetch(`https://app.base44.com/api/apps/68a9b8961cb1d2e5d06464b7/entities/Question`, {
        headers: {
            'api_key': '782640df12bc45c5883f68bb90ea020d', // or use await User.me() to get the API key
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    console.log(data);
}

// JavaScript Example: Updating an Entity
// Filterable fields: quiz_id, question_text, question_type, options, correct_answer, user_answer, is_correct, explanation, topic, difficulty
async function updateQuestionEntity(entityId, updateData) {
    const response = await fetch(`https://app.base44.com/api/apps/68a9b8961cb1d2e5d06464b7/entities/Question/${entityId}`, {
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