const ERROR_MESSAGES = {
	fullName: 'Please enter your full name.',
	email: 'Please enter a valid email address.',
	subject: 'Please enter a subject of at least 3 characters.',
	enquiryType: 'Please choose an enquiry type.',
	message: 'Please enter a message of at least 10 characters.'
};

function getFieldError(field) {
	const value = field.value.trim();

	if (!value) return ERROR_MESSAGES[field.name];
	if (field.name === 'email' && !field.validity.valid) return ERROR_MESSAGES.email;
	if (field.name === 'fullName' && value.length < 2) return ERROR_MESSAGES.fullName;
	if (field.name === 'subject' && value.length < 3) return ERROR_MESSAGES.subject;
	if (field.name === 'message' && value.length < 10) return ERROR_MESSAGES.message;

	return '';
}

function setFieldState(field, message) {
	const row = field.closest('.form-row');
	const error = row?.querySelector('.field-error');
	const hasError = Boolean(message);

	row?.classList.toggle('has-error', hasError);
	field.setAttribute('aria-invalid', String(hasError));
	if (error) error.textContent = message;

	return hasError;
}

function setStatus(status, type, message) {
	status.className = `form-status visible ${type}`;
	status.textContent = message;
}

export function setupContactForm() {
	const form = document.getElementById('contactForm');
	const status = document.getElementById('formStatus');
	if (!form || !status) return;

	const fields = [...form.querySelectorAll('input, select, textarea')];
	fields.forEach((field) => {
		field.addEventListener('blur', () => setFieldState(field, getFieldError(field)));
		field.addEventListener('input', () => {
			if (field.closest('.form-row')?.classList.contains('has-error')) {
				setFieldState(field, getFieldError(field));
			}
		});
		field.addEventListener('change', () => setFieldState(field, getFieldError(field)));
	});

	form.addEventListener('submit', (event) => {
		event.preventDefault();
		const invalidField = fields.find((field) => setFieldState(field, getFieldError(field)));

		if (invalidField) {
			setStatus(status, 'error', 'Please correct the highlighted fields and try again.');
			invalidField.focus();
			return;
		}

		form.reset();
		fields.forEach((field) => setFieldState(field, ''));
		setStatus(status, 'success', 'Thanks! Your enquiry has been submitted. We’ll get back to you soon.');
		status.focus();
	});
}
