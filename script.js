'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const displayMovements = function (movements, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__value">${mov.toFixed(2)}€</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${acc.balance.toFixed(2)}€`;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes.toFixed(2)}€`;

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(out).toFixed(2)}€`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest.toFixed(2)}€`;
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc.movements);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

///////////////////////////////////////
// Event handlers
let currentAccount;
// Fake always logged in
// ----->
currentAccount = account1;
updateUI(currentAccount);
containerApp.style.opacity = 100;
// ----->

const now = new Date();
// labelDate.textContent = now;
// day/month/year
const day = now.getDate();
const month = now.getMonth() + 1;
const year = now.getFullYear();
const hour = now.getHours();
const minutes = now.getMinutes();
labelDate.textContent = `${day}/${month}/${year}, ${hour}:${minutes}`;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Update UI
    updateUI(currentAccount);
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // Add movement
    currentAccount.movements.push(amount);

    // Update UI
    updateUI(currentAccount);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

// Conversion
/* <<<<<<<<<< delete this one if you have too ---------------------------------------->
console.log(23 === 23.0); //true
console.log(Number(`23`)); //string to number
console.log(+`23`); // tring to number

// Parsing
console.log(Number.parseInt(`30px`, 10));
console.log(Number.parseInt(`e23`, 10)); //NaN

console.log(Number.parseFloat(`2.5rem`)); //2.5

// Check if value is NaN
console.log(Number.isNaN(20)); //false (because it isn't not a number)
console.log(Number.isNaN(+`20x`)); //true

// Checking if value is number
console.log(Number.isFinite(20)); //true
console.log(Number.isFinite(`20`)); //false

// Square Root
console.log(Math.sqrt(16));
console.log(16 ** (1 / 2)); // exponentiation
console.log(Math.max(5, 18, `23`, 11, 2)); // returns max does type coercion as well but does not do parsing
console.log(Math.min(5, 18, `23`, 11, 2));
console.log(Math.PI); // constant
console.log(Math.PI * Number.parseFloat`10 px` ** 2); // radius
console.log(Math.trunc(Math.random() * 6) + 1);
const randomInt = (min, max) => Math.floor(Math.random() * (max - min) + 1);
console.log(randomInt(10, 20));

// Rounding Intergers
console.log(Math.trunc(23.3)); // removes decimal
console.log(Math.round(23.9)); // rounds to nearest interger
// .ceil >> rounds down
// .floor >> rounds down
// all these methods also do type coercion
// floor & trunc both cut off decimal part however for negative numbers
console.log(Math.trunc(-23.3)); // just cuts the decimal off
console.log(Math.floor(-23.9)); // rounds up
// .floor is probably a little bit better

// Rounding decimals or floating point numbers
console.log((2.7).toFixed(0)); // 3 >> returns a string
console.log((2.7).toFixed(3)); // 2.700 will add 0's until third decimal point
// .toFixed will always return a string and not a number
// + turns string into number don't forget

// The Remainder Operator
// returns left over from division
console.log(5 % 2); // returns 1
const isEven = n => n % 2 === 0;
console.log(isEven(8)); // true
console.log(isEven(23)); // false

// Numeric Seperators
const diameter = 287_460_000_000;
// can use underscore instead of commas
// makes it easier to understand
console.log(diameter);
// engine basically ignores the underscores
// but again makes it easier for developers to read
const priceCent = 345_99;
console.log(priceCent);
const PI = 3.1415; // can only place underscores inbetween numbers
// will not work at beginning or end of a number either
// also cannot place two in a row
console.log(Number(`230_000`)); //NaN this is a string will only work with numbers
console.log(parseInt(230_000)); //230 everything else will be ignored

// Working with BigInt
console.log(2 ** 53 - 1); // essentially the biggest number that jS can safely represent
console.log(Number.MAX_SAFE_INTEGER); // any interger larger can not be saved accurately
console.log(987261349781623478163487263495872364598765324n); //n turns it into a bigint

// Operations
console.log(10000n + 10000n); // operators work the same with bigint
// cannot mix bigint with regular numbers
console.log(20n > 15); // true
console.log(20n === 20); // false jS doesn't do type coercion with triple equal

// Divisions
console.log(10n / 3n);
console.log(10 / 3);

// Creating Dates
/*
const now = new Date(); // current date
console.log(now);

console.log(new Date(`Wed May 15 2024 03:34:27 `)); // parses date we give it
console.log(new Date(`December 24, 2015`));
console.log(new Date(account1.movementsDates[0])); // based on a string
// can also pass in day months years even seconds this way
// month is zero based so november is 10 not 11

// Working with dates

const future = new Date(2037, 10, 19, 15, 24);
console.log(future);
console.log(future.getFullYear());
console.log(future.getMonth());
console.log(future.getDate());
console.log(future.getDay());
//.getMinutes , .getSeconds
console.log(future.toISOString());
console.log(future.getTime());
future.setFullYear(2040);
console.log(future);
*/

// Adding Dates to 'Bankist' App
