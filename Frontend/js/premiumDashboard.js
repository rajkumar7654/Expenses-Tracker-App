const expenseForm = document.getElementById('expenseForm');
const expenseList = document.getElementById('expenseList');
const totalText = document.getElementById('totalText');
const emptyState = document.getElementById('emptyState');
const userNameElement = document.getElementById('userName');
const submitBtn = document.getElementById('submitBtn');

// ==========================
// PAGINATION ELEMENTS
// ==========================

const expensesPerPageSelect =
    document.getElementById('expensesPerPage');

const paginationInfo =
    document.getElementById('paginationInfo');

const prevPageBtn =
    document.getElementById('prevPageBtn');

const nextPageBtn =
    document.getElementById('nextPageBtn');


let editingExpenseId = null;

let allExpenses = [];

let currentPage = 1;

let expensesPerPage =
    parseInt(localStorage.getItem('expensesPerPage')) || 10;


// ==========================
// User Name
// ==========================

const userName =
    localStorage.getItem('userName') || 'User';

if (userNameElement) {

    userNameElement.textContent =
        `Hi, ${userName}`;

}


// ==========================
// Pagination Initial Value
// ==========================

if (expensesPerPageSelect) {

    expensesPerPageSelect.value =
        expensesPerPage;

}


// ==========================
// ROWS PER PAGE CHANGE
// ==========================

if (expensesPerPageSelect) {

    expensesPerPageSelect.addEventListener(
        'change',
        function () {

            expensesPerPage =
                parseInt(this.value);

            localStorage.setItem(
                'expensesPerPage',
                expensesPerPage
            );

            currentPage = 1;

            displayExpenses();

        }
    );

}


// ==========================
// PREVIOUS PAGE
// ==========================

if (prevPageBtn) {

    prevPageBtn.addEventListener(
        'click',
        () => {

            if (currentPage > 1) {

                currentPage--;

                displayExpenses();

            }

        }
    );

}


// ==========================
// NEXT PAGE
// ==========================

if (nextPageBtn) {

    nextPageBtn.addEventListener(
        'click',
        () => {

            const totalPages =
                Math.ceil(
                    allExpenses.length /
                    expensesPerPage
                );

            if (currentPage < totalPages) {

                currentPage++;

                displayExpenses();

            }

        }
    );

}


// ==========================
// Fetch Expenses
// ==========================

async function fetchExpenses() {

    try {

        console.log('Fetching premium expenses...');

        const token =
            localStorage.getItem('token');

        console.log('Token:', token);


        const response = await fetch(
            '/premium-dashboard/expense',
            {
                method: 'GET',

                headers: {
                    'Authorization':
                        `Bearer ${token}`
                }
            }
        );


        console.log(
            'Response status:',
            response.status
        );


        if (!response.ok) {

            const errorData =
                await response.json();

            console.error(
                'Error response:',
                errorData
            );

            alert(
                'Failed to fetch expenses: ' +
                (
                    errorData.message ||
                    'Unknown error'
                )
            );

            return;
        }


        const expenses =
            await response.json();


        console.log(
            'Expenses received:',
            expenses
        );


        allExpenses =
            expenses || [];


        // Calculate Total Pages

        const totalPages =
            Math.ceil(
                allExpenses.length /
                expensesPerPage
            );


        // If deleting expenses causes
        // current page to disappear,
        // move to last available page.

        if (
            totalPages > 0 &&
            currentPage > totalPages
        ) {

            currentPage =
                totalPages;

        }


        displayExpenses();


    } catch (error) {

        console.error(
            'Error:',
            error
        );

        alert(
            'Error: ' +
            error.message
        );

    }

}


// ==========================
// Display Expenses
// ==========================

function displayExpenses() {

    // Clear old list

    expenseList.innerHTML = '';


    // ==========================
    // NO EXPENSES
    // ==========================

    if (
        !allExpenses ||
        allExpenses.length === 0
    ) {

        expenseList.innerHTML = `
            <li class="empty-state">
                No expenses added yet.
            </li>
        `;


        totalText.textContent =
            'Total: ₹0.00';


        paginationInfo.textContent =
            '0-0 of 0';


        prevPageBtn.disabled =
            true;


        nextPageBtn.disabled =
            true;


        return;

    }


    // ==========================
    // Calculate Total Expense
    // ==========================

    const total =
        allExpenses.reduce(
            (sum, expense) => {

                return sum +
                    parseFloat(
                        expense.amount
                    );

            },
            0
        );


    totalText.textContent =
        `Total: ₹${total.toFixed(2)}`;


    // ==========================
    // PAGINATION CALCULATION
    // ==========================

    const startIndex =
        (currentPage - 1) *
        expensesPerPage;


    const endIndex =
        Math.min(
            startIndex + expensesPerPage,
            allExpenses.length
        );


    // Get only expenses
    // for current page

    const currentExpenses =
        allExpenses.slice(
            startIndex,
            endIndex
        );


    // ==========================
    // DISPLAY CURRENT PAGE
    // ==========================

    currentExpenses.forEach(
        expense => {

            const li =
                document.createElement('li');


            li.className =
                'expense-item';


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


            // ==========================
            // Delete Button
            // ==========================

            const deleteBtn =
                li.querySelector(
                    '.delete-btn'
                );


            deleteBtn.addEventListener(
                'click',
                () => {

                    console.log(
                        'Delete button clicked:',
                        expense.id
                    );

                    deleteExpense(
                        expense.id
                    );

                }
            );


            // ==========================
            // Edit Button
            // ==========================

            const editBtn =
                li.querySelector(
                    '.edit-btn'
                );


            editBtn.addEventListener(
                'click',
                () => {

                    console.log(
                        'Edit button clicked:',
                        expense
                    );

                    editExpense(
                        expense
                    );

                }
            );


            expenseList.appendChild(
                li
            );

        }
    );


    // ==========================
    // Pagination Information
    // ==========================

    paginationInfo.textContent =
        `${startIndex + 1}-${endIndex} of ${allExpenses.length}`;


    // ==========================
    // Total Pages
    // ==========================

    const totalPages =
        Math.ceil(
            allExpenses.length /
            expensesPerPage
        );


    // ==========================
    // Previous Button
    // ==========================

    prevPageBtn.disabled =
        currentPage === 1;


    // ==========================
    // Next Button
    // ==========================

    nextPageBtn.disabled =
        currentPage === totalPages;

}


// ==========================
// Add / Update Expense
// ==========================

expenseForm.addEventListener(
    'submit',
    async function (e) {

        e.preventDefault();


        const amount =
            document.getElementById(
                'amount'
            ).value;


        const description =
            document.getElementById(
                'description'
            ).value;


        const category =
            document.getElementById(
                'category'
            ).value;


        const token =
            localStorage.getItem('token');


        try {

            let response;


            // Update Expense

            if (editingExpenseId) {

                response = await fetch(
                    `/premium-dashboard/expense/${editingExpenseId}`,
                    {
                        method: 'PUT',

                        headers: {

                            'Content-Type':
                                'application/json',

                            'Authorization':
                                `Bearer ${token}`

                        },

                        body: JSON.stringify({
                            amount,
                            description,
                            category
                        })

                    }
                );

            }


            // Add Expense

            else {

                response = await fetch(
                    '/premium-dashboard/add',
                    {
                        method: 'POST',

                        headers: {

                            'Content-Type':
                                'application/json',

                            'Authorization':
                                `Bearer ${token}`

                        },

                        body: JSON.stringify({
                            amount,
                            description,
                            category
                        })

                    }
                );

            }


            const data =
                await response.json();


            console.log(
                'API response:',
                data
            );


            if (response.ok) {

                if (editingExpenseId) {

                    alert(
                        'Expense updated successfully'
                    );

                } else {

                    alert(
                        'Expense added successfully'
                    );

                }


                expenseForm.reset();


                editingExpenseId =
                    null;


                submitBtn.textContent =
                    'Add Expense';


                currentPage = 1;


                await fetchExpenses();

            } else {

                console.error(
                    'API error:',
                    data
                );


                alert(
                    `Error ${
                        data.status ||
                        response.status
                    }: ${
                        data.message ||
                        'Something went wrong'
                    }`
                );

            }


        } catch (error) {

            console.error(
                'Error:',
                error
            );


            alert(
                `Error: ${error.message}`
            );

        }

    }
);


// ==========================
// Delete Expense
// ==========================

async function deleteExpense(id) {

    const token =
        localStorage.getItem('token');


    try {

        const response =
            await fetch(
                `/premium-dashboard/expense/${id}`,
                {
                    method: 'DELETE',

                    headers: {
                        'Authorization':
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        if (response.ok) {

            alert(
                'Expense deleted successfully'
            );


            await fetchExpenses();

        } else {

            alert(
                data.message ||
                'Failed to delete expense'
            );

        }


    } catch (error) {

        console.error(
            'Error:',
            error
        );


        alert(
            'An error occurred'
        );

    }

}


// ==========================
// Edit Expense
// ==========================

function editExpense(expense) {

    editingExpenseId =
        expense.id;


    document.getElementById(
        'amount'
    ).value =
        expense.amount;


    document.getElementById(
        'description'
    ).value =
        expense.description;


    document.getElementById(
        'category'
    ).value =
        expense.category;


    submitBtn.textContent =
        'Update Expense';


    document.getElementById(
        'amount'
    ).focus();

}






// ==========================
// Download Report
// ==========================

async function downloadReport() {

    try {

        const token =
            localStorage.getItem('token');


        const response =
            await fetch(
                '/premium-dashboard/download-report',
                {
                    headers: {
                        'Authorization':
                            `Bearer ${token}`
                    }
                }
            );


        if (!response.ok) {

            alert(
                'Failed to download report'
            );

            return;

        }


        const blob =
            await response.blob();


        const url =
            window.URL.createObjectURL(
                blob
            );


        const a =
            document.createElement('a');


        a.href =
            url;


        a.download =
            `expense-report-${Date.now()}.pdf`;


        document.body.appendChild(a);


        a.click();


        window.URL.revokeObjectURL(
            url
        );


        document.body.removeChild(a);


    } catch (error) {

        console.error(
            error
        );


        alert(
            'Something went wrong'
        );

    }

}


// ==========================
// Fetch Leaderboard
// ==========================

async function fetchLeaderboardInternal() {

    try {

        const token =
            localStorage.getItem('token');


        const response =
            await fetch(
                '/premium-dashboard/leaderboard',
                {
                    method: 'GET',

                    headers: {
                        'Authorization':
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        console.log(
            'Leaderboard response:',
            data
        );


        if (!response.ok) {

            alert(
                data.message ||
                'Failed to fetch leaderboard'
            );

            return;

        }


        displayLeaderboard(
            data
        );


    } catch (error) {

        console.error(
            'Leaderboard Error:',
            error
        );


        alert(
            'Something went wrong'
        );

    }

}


// ==========================
// Display Leaderboard
// ==========================

function displayLeaderboard(data) {

    const container =
        document.querySelector(
            '.leaderboard-container'
        );


    if (!container) {

        console.error(
            'Leaderboard container not found'
        );

        return;

    }

    // Add show class to make it visible
    container.classList.add('show');


    if (
        !data ||
        data.length === 0
    ) {

        container.innerHTML = `
            <p class="leaderboard-empty">
                No expenses found
            </p>
        `;

        return;

    }


    let html = `

        <div class="leaderboard-card">

            <div class="leaderboard-heading">

                <h2 class="leaderboard-title">
                    🏆 Leaderboard
                </h2>

                <button
                    class="btn-refresh-leaderboard"
                    type="button"
                    onclick="fetchLeaderboardInternal()"
                    title="Refresh Leaderboard"
                    aria-label="Refresh Leaderboard"
                >
                    ↻
                </button>

            </div>


            <table class="leaderboard-table">

                <thead>

                    <tr class="leaderboard-header">

                        <th>Rank</th>

                        <th>Username</th>

                        <th>Total Expenses</th>

                    </tr>

                </thead>


                <tbody>

    `;


    data.forEach(
        (item, index) => {

            const rank =
                index + 1;


            const rankClass =
                rank === 1
                    ? 'rank-gold'
                    : rank === 2
                    ? 'rank-silver'
                    : rank === 3
                    ? 'rank-bronze'
                    : 'rank-normal';


            html += `

                <tr class="leaderboard-row">

                    <td class="leaderboard-cell">

                        <span
                            class="rank-badge ${rankClass}"
                        >
                            ${rank}
                        </span>

                    </td>


                    <td class="leaderboard-cell">
                        ${item.name}
                    </td>


                    <td
                        class="leaderboard-cell leaderboard-amount"
                    >
                        ₹${item.total_cost}
                    </td>

                </tr>

            `;

        }
    );


    html += `

                </tbody>

            </table>

        </div>

    `;


    container.innerHTML =
        html;

}


// ==========================
// Logout
// ==========================

function logout() {

    localStorage.removeItem(
        'token'
    );


    localStorage.removeItem(
        'userName'
    );


    window.location.href =
        '/user/login';

}


// ==========================
// Page Load
// ==========================

document.addEventListener(
    'DOMContentLoaded',
    () => {

        fetchExpenses();

        // Leaderboard Button
        const leaderboardBtn = document.querySelector('.btn-leaderboard');
        if (leaderboardBtn) {
            leaderboardBtn.addEventListener('click', async function() {
                await fetchLeaderboardInternal();
                const leaderboardContainer = document.querySelector('.leaderboard-container');
                if (leaderboardContainer) {
                    leaderboardContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        }

        // Download Button
        const downloadBtn = document.querySelector('.btn-download');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', downloadReport);
        }

    }
);