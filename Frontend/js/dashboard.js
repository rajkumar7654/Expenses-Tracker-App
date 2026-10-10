const expenseForm = document.getElementById('expenseForm');
const expenseList = document.getElementById('expenseList');
const totalText = document.getElementById('totalText');
const emptyState = document.getElementById('emptyState');
const userNameElement = document.getElementById('userName');
const submitBtn = document.getElementById('submitBtn');
const getPremiumBtn = document.querySelector('.get-premium-btn');

// PAGINATION ELEMENTS
const expensesPerPageSelect = document.getElementById('expensesPerPage');
const paginationInfo = document.getElementById('paginationInfo');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');

let editingExpenseId = null;
let allExpenses = [];
let currentPage = 1;

let expensesPerPage = parseInt(localStorage.getItem('expensesPerPage')) || 10;

const userName = localStorage.getItem('userName') || 'User';

if (userNameElement) {

    userNameElement.textContent = `Hi, ${userName}`;
}

if (getPremiumBtn) {

    getPremiumBtn.addEventListener('click', () => {

        window.location.href = '/payment';

    });

}

if (expensesPerPageSelect) {

    expensesPerPageSelect.value = expensesPerPage;

}

//ROWS PER PAGE CHANGE
if (expensesPerPageSelect) {

    expensesPerPageSelect.addEventListener('change', function () {

            expensesPerPage = parseInt(this.value);

            localStorage.setItem('expensesPerPage', expensesPerPage);
            currentPage = 1;
            displayExpenses();

        }
    );

}


//PREVIOUS PAGE
if (prevPageBtn) {

    prevPageBtn.addEventListener('click', () => {

            if (currentPage > 1) {

                currentPage--;

                displayExpenses();

            }

        }
    );

}

//Next PAGE
if (nextPageBtn) {

    nextPageBtn.addEventListener('click', () => {

            const totalPages = Math.ceil(allExpenses.length / expensesPerPage);

            if (currentPage < totalPages) {

                currentPage++;

                displayExpenses();

            }

        }
    );

}

//FETCH EXPENSES
async function fetchExpenses() {

    try {

        console.log('Fetching expenses...');
        const token = localStorage.getItem('token');
        console.log('Token:', token);

        const response = await fetch('/dashboard/expense', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });


        console.log('Response status:', response.status);


        if (!response.ok) {

            const errorData = await response.json();

            console.error('Error response:', errorData);

            alert('Failed to fetch expenses: ' + (errorData.message || 'Unknown error'));

            return;
        }

        const expenses = await response.json();
        console.log('Expenses received:', expenses);
        allExpenses = expenses || [];

        //Calculate Total Page
        const totalPages = Math.ceil(allExpenses.length / expensesPerPage);


        //If deleting expenses causes current page to disappear, move to the last available page.
        

        if (
            totalPages > 0 &&
            currentPage > totalPages
        ) {

            currentPage =
                totalPages;

        }

        displayExpenses();


    } catch (error) {

        console.error('Error:', error);

        alert('Error: ' + error.message);

    }

}


//Display Expenses
function displayExpenses() {

    //Clear old list
    expenseList.innerHTML = '';


    //NO EXPENSES
    if (!allExpenses || allExpenses.length === 0) {

        expenseList.innerHTML = `
            <li class="empty-state">
                No expenses added yet.
            </li>
        `;


        totalText.textContent = 'Total: ₹0.00';


        paginationInfo.textContent = '0-0 of 0';


        prevPageBtn.disabled = true;


        nextPageBtn.disabled = true;


        return;

    }


    //Calculate Total Expense
    const total = allExpenses.reduce((sum, expense) => {
        return sum + parseFloat(expense.amount);
    }, 0);


    totalText.textContent = `Total: ₹${total.toFixed(2)}`;


    //PAGINATION CALCULATION
    const startIndex = (currentPage - 1) * expensesPerPage;
    const endIndex = Math.min(startIndex + expensesPerPage, allExpenses.length);


    //Get only expenses for current page
    const currentExpenses = allExpenses.slice(startIndex, endIndex);


    //DISPLAY CURRENT PAGE
    currentExpenses.forEach(expense => {

        const li = document.createElement('li');


        li.className = 'expense-item';


        li.innerHTML = `

                <div class="expense-info">

                    <span class="expense-desc">
                        ${expense.description}
                    </span>

                    <span class="expense-category">
                        ${expense.category}
                    </span>

                </div>


                <span class="expense-amount">
                    ₹${expense.amount}
                </span>


                <div class="expense-actions">

                    <button
                        type="button"
                        class="edit-btn"
                    >
                        Edit
                    </button>


                    <button
                        type="button"
                        class="delete-btn"
                    >
                        Delete
                    </button>

                </div>

        `;


        
        //Delete Button
        const deleteBtn = li.querySelector('.delete-btn');


        deleteBtn.addEventListener('click', () => {

            console.log('Delete button clicked:', expense.id);
            deleteExpense(expense.id);

        });


        //Edit Button
        const editBtn = li.querySelector('.edit-btn');


        editBtn.addEventListener('click', () => {

            console.log('Edit button clicked:', expense);

            editExpense(expense);

        });
        expenseList.appendChild(li);

        }
    );


    //Pagination Information
    paginationInfo.textContent = `${startIndex + 1}-${endIndex} of ${allExpenses.length}`;

    //Total Pages

    const totalPages = Math.ceil(allExpenses.length / expensesPerPage);


    //Previous Button

    prevPageBtn.disabled = currentPage === 1;


    //Next Button

    nextPageBtn.disabled = currentPage === totalPages;

}



//Add and Update expenses
expenseForm.addEventListener('submit', async function (e) {
    e.preventDefault();


    //Get Form Values
    const amount = document.getElementById('amount').value;
    const description = document.getElementById('description').value;
    const category = document.getElementById('category').value;
    const token = localStorage.getItem('token');

    try {

        let response;

        //Update Expenses

        if (editingExpenseId) {

            response = await fetch(`/dashboard/expense/${editingExpenseId}`, {
                method: 'PUT',

                headers: {

                    'Content-Type': 'application/json',

                    'Authorization': `Bearer ${token}`

                },

                body: JSON.stringify({amount, description, category})

            });

        }

        //Add Expense
        else {

            response = await fetch('/dashboard/add', {

                method: 'POST',

                headers: {

                    'Content-Type': 'application/json',

                    'Authorization': `Bearer ${token}`

                },

                body: JSON.stringify({amount, description, category})

            });

        }


        
        const data = await response.json();


        console.log('API response:', data);

        //Success
        if (response.ok) {

            if (editingExpenseId) {

                alert('Expense updated successfully');

            } else {

                alert('Expense added successfully');

            }

            expenseForm.reset();


            editingExpenseId = null;


            submitBtn.textContent = 'Add Expense';


            currentPage = 1;

            await fetchExpenses();

        }
        else {

            console.error('API error:', data);
            alert(`Error ${data.status || response.status}: ${data.message || 'Something went wrong'}`);

        }


        } catch (error) {

            console.error('Error:', error);


            alert(`Error: ${error.message}`);

        }

    }
);

//Delete Expense
async function deleteExpense(id) {

    const token = localStorage.getItem('token');
    try {

        const response = await fetch(`/dashboard/expense/${id}`, {
            method: 'DELETE',

            headers: {
                'Authorization': `Bearer ${token}`
            }
        });


        const data = await response.json();
        if (response.ok) {

            alert('Expense deleted successfully');

            await fetchExpenses();

        }

        else {

            alert(data.message || 'Failed to delete expense');

        }


    } catch (error) {

        console.error('Error:', error);
        alert('An error occurred');

    }

}

//Edit Expenses
function editExpense(expense) {
    editingExpenseId = expense.id;
    document.getElementById('amount').value = expense.amount;
    document.getElementById('description').value = expense.description;
    document.getElementById('category').value = expense.category;


    submitBtn.textContent = 'Update Expense';

    document.getElementById('amount').focus();

}

//LogOut

function logout() {

    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    window.location.href = '/user/login';

}



//Page Load
document.addEventListener('DOMContentLoaded', () => {

    fetchExpenses();

});

