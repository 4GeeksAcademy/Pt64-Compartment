const getState = ({ getStore, getActions, setStore }) => {
	return {
		store: {
			message: null,
			categories: [
				{
					id: "1",
					name: "chicken nugget",
					items: [
						'Item A', 'Item B', 'Item C'
					]
				},
			],
		},
		actions: {
			fetchApartments: async (location) => {
				const response = await fetch(process.env.BACKEND_URL +`/api/apartments?location=${location}`);
				const data = await response.json();
				return data;
			},
			
			logOut: () => {
				sessionStorage.removeItem('token');
				setStore({ token: null });
			},

			getMessage: async () => {
				try {
					const resp = await fetch(process.env.BACKEND_URL + "/api/hello");
					const data = await resp.json();
					setStore({ message: data.message });
					return data;
				} catch (error) {
					console.log("Error loading message from backend", error);
				}
			},
			
			signUp: async (email, password) => {
				try {
					const req = await fetch(process.env.BACKEND_URL + '/api/signup', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({ email: email, password: password })
					});
					if (!req.ok) {
						throw new Error(`HTTP error status: ${req.status}`);
					}
					const data = await req.json();
					console.log('data signing up user', data);
					return true;
				} catch (error) {
					console.log('error signing up user', error.message);
					return false;
				}
			},

			logIn: async (email, password) => {
				try {
					const req = await fetch(process.env.BACKEND_URL + "/api/signin", {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({ email: email, password: password })
					});
					if (!req.ok) {
						throw new Error(`HTTP error status: ${req.status}`);
					}
					const data = await req.json();
					sessionStorage.setItem("token", data.access_token);
					setStore({ token: data.access_token });
					console.log('data logging in user', data);
					return true;
				} catch (error) {
					console.log('error logging in user', error.message);
					return false;
				}
			},

			private: async () => {
				try {
					let options = {
						headers: {
							'Authorization': 'Bearer' + sessionStorage.getItem('token')
						}
					}
					let response = await fetch(process.env.BACKEND_URL + "/api/private", options)
					let data = await response.json()
				}
				catch (error) {
					console.log(error)
				}
			}
		}
	};
};

export default getState;
