/**
 * Sanitize HTML content to prevent XSS attacks
 * This function uses the browser's built-in DOMParser to sanitize HTML
 * and only allows safe tags and attributes
 */

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'a', 'span', 'div', 'blockquote', 'pre', 'code'
];

const ALLOWED_ATTRIBUTES: { [key: string]: string[] } = {
  'a': ['href', 'target', 'rel'],
  'span': ['class'],
  'div': ['class'],
  'p': ['class'],
  'h1': ['class'],
  'h2': ['class'],
  'h3': ['class'],
  'h4': ['class'],
  'h5': ['class'],
  'h6': ['class'],
};

/**
 * Sanitize HTML string by removing potentially dangerous content
 * @param html - The HTML string to sanitize
 * @returns Sanitized HTML string
 */
export const sanitizeHtml = (html: string): string => {
  if (!html) return '';

  // Create a temporary div to parse the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Recursively clean the nodes
  const cleanNode = (node: Node): Node | null => {
    // If it's a text node, return it as is
    if (node.nodeType === Node.TEXT_NODE) {
      return node.cloneNode(true);
    }

    // If it's an element node
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const tagName = element.tagName.toLowerCase();

      // Check if tag is allowed
      if (!ALLOWED_TAGS.includes(tagName)) {
        // If tag is not allowed, return its children
        const fragment = document.createDocumentFragment();
        Array.from(element.childNodes).forEach(child => {
          const cleanedChild = cleanNode(child);
          if (cleanedChild) {
            fragment.appendChild(cleanedChild);
          }
        });
        return fragment;
      }

      // Create a new clean element
      const cleanElement = document.createElement(tagName);

      // Copy allowed attributes
      const allowedAttrs = ALLOWED_ATTRIBUTES[tagName] || [];
      Array.from(element.attributes).forEach(attr => {
        if (allowedAttrs.includes(attr.name)) {
          // Additional check for href to prevent javascript: URLs
          if (attr.name === 'href') {
            const href = attr.value.trim().toLowerCase();
            if (!href.startsWith('javascript:') && !href.startsWith('data:')) {
              cleanElement.setAttribute(attr.name, attr.value);
            }
          } else {
            cleanElement.setAttribute(attr.name, attr.value);
          }
        }
      });

      // Add rel="noopener noreferrer" to links for security
      if (tagName === 'a' && !cleanElement.hasAttribute('rel')) {
        cleanElement.setAttribute('rel', 'noopener noreferrer');
      }

      // Recursively clean and append children
      Array.from(element.childNodes).forEach(child => {
        const cleanedChild = cleanNode(child);
        if (cleanedChild) {
          cleanElement.appendChild(cleanedChild);
        }
      });

      return cleanElement;
    }

    return null;
  };

  // Clean all child nodes
  const cleanedFragment = document.createDocumentFragment();
  Array.from(tempDiv.childNodes).forEach(child => {
    const cleanedChild = cleanNode(child);
    if (cleanedChild) {
      cleanedFragment.appendChild(cleanedChild);
    }
  });

  // Create a temporary div to get the HTML string
  const resultDiv = document.createElement('div');
  resultDiv.appendChild(cleanedFragment);

  return resultDiv.innerHTML;
};

/**
 * Strip all HTML tags from a string, leaving only text content
 * @param html - The HTML string to strip
 * @returns Plain text content
 */
export const stripHtmlTags = (html: string): string => {
  if (!html) return '';
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || '';
};

