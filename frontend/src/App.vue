<script setup lang="ts">
import {defineComponent, ref} from "vue";
import axios from "axios";

const apiUrl = "http://localhost:3000/api"

const selectedUser = ref<User>({
  name: '',
  firstname: '',
  email: '',
  phone: '',
  roles: []
});
const selectedRole = ref<Role>({
  name: '',
  permissions: []
});
const selectedPermission = ref<Permission>({
  name: ''
});

const users = ref([]);
const roles = ref([]);
const permissions = ref([]);
const loadData = async () => {
  try {
    const user_response = await axios.get(apiUrl + '/users');
    users.value = user_response.data;
    const roles_response = await axios.get(apiUrl + '/roles');
    roles.value = roles_response.data;
    const permissions_response = await axios.get(apiUrl + '/permissions');
    permissions.value = permissions_response.data;
  } catch (err) {
    console.log(err);
  }
}
loadData();

const saveUser = async () => {
  try {
    const userResponse = await axios.post(apiUrl + '/users', selectedUser.value);
    if (userResponse.status == 200) {
      alert('User Saved Successfully');
      closeModal();
      await loadData();
    }
  } catch (err) {
    console.log(err)
  }
}

const newUser = () => {
  openUserModal({
    name: '',
    firstname: '',
    email: '',
    phone: '',
    roles: []
  });
}
const openUserModal = (item: User) => {
  const modal = document.getElementById('users-modal');
  selectedUser.value = {...item};
  if (modal) {
    modal.classList.add('show');
  }
}

const newRole = () => {
  openRoleModal({
    name: '',
    permissions: []
  });
}
const deleteRole = async (itemId: number) => {
  try {
    const response = await axios.delete(apiUrl + '/roles/' + itemId);
    if (response.status == 200) {
      alert('Role Deleted');
      closeModal();
      await loadData();
    }
  } catch (err) {
    console.log(err)
  }
}
const saveRole = async () => {
  try {
    const response = await axios.post(apiUrl + '/roles', selectedRole.value);
    if (response.status == 200) {
      alert('Role Saved Successfully');
      closeModal();
      await loadData();
    }
  } catch (err) {
    console.log(err)
  }
}

const openRoleModal = (item: Role) => {
  const modal = document.getElementById('roles-modal');
  selectedRole.value = {...item};
  if (modal) {
    modal.classList.add('show');
  }
}


const newPermission = () => {
  openPermissionsModal({
    name: ''
  });
}
const deletePermission = async (itemId: number) => {
  try {
    const response = await axios.delete(apiUrl + '/permissions/' + itemId);
    if (response.status == 200) {
      alert('Permissiom Deleted');
      closeModal();
      await loadData();
    }
  } catch (err) {
    console.log(err)
  }
}
const savePermission = async () => {
  try {
    console.log(selectedPermission);
    const response = await axios.post(apiUrl + '/permissions', selectedPermission.value);
    if (response.status == 200) {
      alert('Role Saved Successfully');
      closeModal();
      await loadData();
    }
  } catch (err) {
    console.log(err)
  }
}

const openPermissionsModal = (item: Permission) => {
  const modal = document.getElementById('permissions-modal');
  selectedPermission.value = {...item};
  if (modal) {
    modal.classList.add('show');
  }
}

const closeModal = () => {
  const modalElements = document.querySelectorAll('.modal');
  modalElements.forEach(modal => {
    modal.classList.remove('show');
  });
}

</script>

<template>

  <nav>
    <ul class="nav nav-tabs" id="main-nav" role="tablist">
      <li class="nav-item" role="presentation">
        <button class="nav-link active" id="home-tab" data-bs-toggle="tab" data-bs-target="#users-tab-pane"
                type="button"
                role="tab" aria-controls="users-tab-pane" aria-selected="true">Users
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link" id="permissions-tab" data-bs-toggle="tab" data-bs-target="#roles-tab-pane"
                type="button"
                role="tab" aria-controls="roles-tab-pane" aria-selected="false">Roles
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link" id="permissions-tab" data-bs-toggle="tab" data-bs-target="#permissions-tab-pane"
                type="button"
                role="tab" aria-controls="permissions-tab-pane" aria-selected="false">permissions
        </button>
      </li>
    </ul>
  </nav>

  <div class="tab-content" id="myTabContent">
    <div class="tab-pane fade show active" id="users-tab-pane" role="tabpanel" aria-labelledby="users-tab" tabindex="0">
      <h1>Users</h1>
      <button type="button" class="btn btn-success float-end me-5" @click="newUser()">Add User</button>
      <table class="table table-hover">
        <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Firstname</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Roles</th>
          <th></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, index) in users" :key="index">
          <td>{{ item.id }}</td>
          <td>{{ item.name }}</td>
          <td>{{ item.firstname }}</td>
          <td>{{ item.email }}</td>
          <td>{{ item.phone }}</td>
          <td>{{ item.roles.toString() }}</td>
          <td>
            <button type="button" class="btn btn-primary me-2" @click="openUserModal(item)">Edit</button>
          </td>
        </tr>
        </tbody>
      </table>
      <div class="modal fade" id="users-modal" tabindex="-1" aria-labelledby="user-edit-modal" aria-hidden="true"
           ref="userModal">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h1 class="modal-title fs-5" id="users-modal-label">User Data</h1>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
                      @click="closeModal()"></button>
            </div>
            <div class="modal-body">
              <form>
                <div class="mb-3">
                  <label for="email" class="form-label">Name</label>
                  <input type="email" class="form-control" id="name" v-model="selectedUser.name">
                </div>
                <div class="mb-3">
                  <label for="email" class="form-label">Firstname</label>
                  <input type="email" class="form-control" id="firstname" v-model="selectedUser.firstname">
                </div>
                <div class="mb-3">
                  <label for="email" class="form-label">Email address</label>
                  <input type="email" class="form-control" id="email" v-model="selectedUser.email">
                </div>
                <div class="mb-3">
                  <label for="email" class="form-label">Phone</label>
                  <input type="email" class="form-control" id="phone" v-model="selectedUser.phone">
                </div>
                <div class="mb-3">
                  Roles
                  <div class="form-check" v-for="(role, index) in roles" :key="index">
                    <input class="form-check-input" type="checkbox" name="roles[]" :value="role.id"
                           :id="'role_' + role.id" v-model="selectedUser.roles">
                    <label class="form-check-label" :for="'role_'+role.id">
                      {{ role.name }}
                    </label>
                  </div>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeModal()">Close</button>
              <button type="button" class="btn btn-primary" @click="saveUser()">Save changes</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="tab-pane fade" id="roles-tab-pane" role="tabpanel" aria-labelledby="roles-tab" tabindex="0">
      <h1>Roles</h1>
      <button type="button" class="btn btn-success float-end me-5" @click="newRole()">Add Role</button>
      <table class="table table-hover">
        <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Permissions</th>
          <th></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, index) in roles" :key="index">
          <td>{{ item.id }}</td>
          <td>{{ item.name }}</td>
          <td>{{ item.permissions.toString() }}</td>
          <td>
            <button type="button" class="btn btn-primary  me-5" @click="openRoleModal(item)">Edit</button>
            <button type="button" class="btn btn-danger " @click="deleteRole(item.id)">Delete</button>
          </td>
        </tr>
        </tbody>
      </table>
      <div class="modal fade" id="roles-modal" tabindex="-1" aria-labelledby="role-modal" aria-hidden="true"
           ref="roleModal">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h1 class="modal-title fs-5" id="users-modal-label">Role Data</h1>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
                      @click="closeModal()"></button>
            </div>
            <div class="modal-body">
              <form>
                <div class="mb-3">
                  <label for="email" class="form-label">Name</label>
                  <input type="email" class="form-control" id="name" v-model="selectedRole.name">
                </div>
                <div class="mb-3">
                  Roles
                  <div class="form-check" v-for="(permission, index) in permissions" :key="index">
                    <input class="form-check-input" type="checkbox" name="permissions[]" :value="permission.id"
                           :id="'permission_' + permission.id" v-model="selectedRole.permissions">
                    <label class="form-check-label" :for="'role_'+permission.id">
                      {{ permission.name }}
                    </label>
                  </div>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeModal()">Close</button>
              <button type="button" class="btn btn-primary" @click="saveRole()">Save changes</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="tab-pane fade" id="permissions-tab-pane" role="tabpanel" aria-labelledby="permissions-tab" tabindex="0">
      <h1>Permissions</h1>
      <button type="button" class="btn btn-success float-end me-5" @click="newPermission()">Add Permission</button>
      <table class="table table-hover">
        <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, index) in permissions" :key="index">
          <td>{{ item.id }}</td>
          <td>{{ item.name }}</td>
          <td>
            <button type="button" class="btn btn-danger " @click="deletePermission(item.id)">Delete</button>
          </td>
        </tr>
        </tbody>
      </table>
      <div class="modal fade" id="permissions-modal" tabindex="-1" aria-labelledby="permission-modal" aria-hidden="true"
           ref="permissionModal">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h1 class="modal-title fs-5" id="users-modal-label">Permission Data</h1>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
                      @click="closeModal()"></button>
            </div>
            <div class="modal-body">
              <form>
                <div class="mb-3">
                  <label for="email" class="form-label">Name</label>
                  <input type="email" class="form-control" id="name" v-model="selectedPermission.name">
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeModal()">Close</button>
              <button type="button" class="btn btn-primary" @click="savePermission()">Save changes</button>
            </div>
          </div>
        </div>
      </div>
    </div>


  </div>

</template>

<style scoped>
.show {
  display: block;
}
</style>
