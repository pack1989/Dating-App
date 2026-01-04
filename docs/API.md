API (Draft)

POST /api/auth/register
- Create account with email and password
- Body: firstName, lastName, phone?, email, password, profilePhotoUrl?

POST /api/auth/login
- Login and create session
- Body: email, password

GET /api/profile
- Get current user profile

POST /api/profile
- Update profile details

GET /api/people
- List people with filters

GET /api/likes
- List users who liked you

GET /api/chats
- List chat threads
