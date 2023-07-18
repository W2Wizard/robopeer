window.addEventListener('DOMContentLoaded', () => {
	const app = document.getElementById('app');
	app.innerHTML = `
		<h1>Hello World!</h1>
		<p>Current time: ${new Date()}</p>
	`;
});
