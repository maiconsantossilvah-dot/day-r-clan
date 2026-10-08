export function toggleDropdown(element, force) { if (!element) return; element.hidden = force === undefined ? !element.hidden : !force; }
