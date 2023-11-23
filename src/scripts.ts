import $ from 'jquery';
import sum from './utils/sum/sum';

console.log('Ready for coding');

console.log('Body jQuery node:', $('body'));
console.log('Body javascript node:', document.querySelector('body'));
console.log('2 + 3 =', sum(2, 3));


import axios from 'axios';

interface User {
  id?: number;
  picture: string;
  name: string;
  gender: string;
  education: string;
  occupation: string;
  hobby: string;
  createdAt: string;
  updatedAt: string;
}

function createUserCard(user: User, onUpdate: () => void): HTMLDivElement {
  const card = document.createElement('div');
  card.classList.add('user-card');
  card.setAttribute('data-userid', user.id ? user.id.toString() : '');

  card.innerHTML = `
    <img class="image--style" src="${user.picture}" alt="${user.name}">
    <h3>${user.name}</h3>
    <p>Gender: ${user.gender}</p>
    <p>Education: ${user.education}</p>
    <p>Occupation: ${user.occupation}</p>
    <p>Hobby: ${user.hobby}</p>
    <p>Created: ${user.createdAt}</p>
    <p>Updated: ${calculateTimeDifference(user.updatedAt)}</p>
    <div class="button--wrapper">
      <button class="edit-btn" data-userid="${user.id}">Edit</button>
      <button class="delete-btn" data-userid="${user.id}">Delete</button>
    </div>
  `;

  card.querySelector('.edit-btn').addEventListener('click', (event) => {
    event.stopPropagation();
    const userId = card.getAttribute('data-userid');
    editUser(userId, onUpdate);
  });

  card.querySelector('.delete-btn').addEventListener('click', (event) => {
    event.stopPropagation();
    const userId = card.getAttribute('data-userid');
    deleteUser(userId, onUpdate);
  });

  return card;
}

function createEditForm(user: User, onSave: (updatedUser: User) => void, onCancel: () => void): HTMLFormElement {
  const form = document.createElement('form');
  form.classList.add('edit-form');

  form.innerHTML = `
    <label for="editPicture">Picture URL:</label>
    <input type="text" id="editPicture" name="editPicture" value="${user.picture}" required>
    <label for="editName">Name:</label>
    <input type="text" id="editName" name="editName" value="${user.name}" required>
    <label for="editGender">Gender:</label>
    <input type="text" id="editGender" name="editGender" value="${user.gender}" required>
    <label for="editEducation">Education:</label>
    <input type="text" id="editEducation" name="editEducation" value="${user.education}" required>
    <label for="editOccupation">Occupation:</label>
    <input type="text" id="editOccupation" name="editOccupation" value="${user.occupation}" required>
    <label for="editHobby">Hobby:</label>
    <input type="text" id="editHobby" name="editHobby" value="${user.hobby}" required>
    <div class="button--wrapper edit--wrapper">
      <button type="button" class="save-btn">Save</button>
      <button type="button" class="cancel-btn">Cancel</button>
    </div>
    <p>Updated: ${calculateTimeDifference(user.updatedAt)}</p>
  `;

  const saveButton = form.querySelector('.save-btn') as HTMLButtonElement;
  const cancelButton = form.querySelector('.cancel-btn') as HTMLButtonElement;

  saveButton.addEventListener('click', async () => {
    const updatedUser: User = {
      id: user.id,
      picture: (form.querySelector('#editPicture') as HTMLInputElement).value,
      name: (form.querySelector('#editName') as HTMLInputElement).value,
      gender: (form.querySelector('#editGender') as HTMLInputElement).value,
      education: (form.querySelector('#editEducation') as HTMLInputElement).value,
      occupation: (form.querySelector('#editOccupation') as HTMLInputElement).value,
      hobby: (form.querySelector('#editHobby') as HTMLInputElement).value,
      createdAt: user.createdAt,
      updatedAt: new Date().toLocaleString(),
    };

    await axios.put(`http://localhost:3004/users/${user.id}`, updatedUser);
    onSave(updatedUser);
  });

  cancelButton.addEventListener('click', () => {
    onCancel();
  });

  return form;
}

function calculateTimeDifference(updatedAt: string): string {
  const now = new Date();
  const updatedDate = new Date(updatedAt);
  const timeDifference = now.getTime() - updatedDate.getTime();

  const seconds = Math.floor(timeDifference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);

  if (years > 0) {
    return years === 1 ? '1 year ago' : `${years} years ago`;
  } else if (months > 0) {
    return months === 1 ? '1 month ago' : `${months} months ago`;
  } else if (days > 0) {
    return days === 1 ? '1 day ago' : `${days} days ago`;
  } else if (hours > 0) {
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  } else if (minutes > 0) {
    return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
  } else {
    return 'Just now';
  }
}

async function fetchAndDisplayUserCards(onUpdate: () => void) {
  try {
    const response = await axios.get('http://localhost:3004/users');
    const users: User[] = response.data;

    const userCardsContainer = document.getElementById('userCards');
    userCardsContainer.innerHTML = '';

    users.forEach(user => {
      const card = createUserCard(user, onUpdate);
      userCardsContainer.appendChild(card);
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
}

function resetForm() {
  (document.getElementById('addUserForm') as HTMLFormElement).reset();
}

async function editUser(userId: string | null, onUpdate: () => void) {
  const user = await getUserById(userId);

  if (user) {
    const userCard = document.querySelector(`[data-userid="${userId}"]`) as HTMLElement;
    const editForm = createEditForm(user, (updatedUser) => {
      userCard.innerHTML = '';
      userCard.appendChild(createUserCard(updatedUser, onUpdate));
    }, () => {
      userCard.innerHTML = '';
      userCard.appendChild(createUserCard(user, onUpdate));
    });

    userCard.innerHTML = '';
    userCard.appendChild(editForm);
  }
}

async function deleteUser(userId: string | null, onUpdate: () => void) {
  if (confirm('Are you sure you want to delete this user?')) {
    try {
      await axios.delete(`http://localhost:3004/users/${userId}`);
      const userCard = document.querySelector(`[data-userid="${userId}"]`) as HTMLElement;
      userCard.remove();
      onUpdate();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  }
}

async function getUserById(userId: string | null): Promise<User | undefined> {
  try {
    const response = await axios.get(`http://localhost:3004/users/${userId}`);
    return response.data as User;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return undefined;
  }
}

// Initial fetch and display
fetchAndDisplayUserCards(() => {});

document.getElementById('submitBtn').addEventListener('click', async function () {
  try {
    const newUser: User = {
      picture: (document.getElementById('picture') as HTMLInputElement).value,
      name: (document.getElementById('name') as HTMLInputElement).value,
      gender: (document.getElementById('gender') as HTMLInputElement).value,
      education: (document.getElementById('education') as HTMLInputElement).value,
      occupation: (document.getElementById('occupation') as HTMLInputElement).value,
      hobby: (document.getElementById('hobby') as HTMLInputElement).value,
      createdAt: new Date().toLocaleString(),
      updatedAt: new Date().toLocaleString(),
    };

    await axios.post('http://localhost:3004/users', newUser);

    fetchAndDisplayUserCards(() => {});
    resetForm();
  } catch (error) {
    console.error('Error adding new user:', error);
  }
});