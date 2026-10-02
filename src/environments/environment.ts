import { isDevMode } from '@angular/core';

export const environment = {
  production: !isDevMode(),
  apiUrl: isDevMode()
    ? 'https://localhost:7114'
    : 'https://fitnance-api-htftetb5h5b5fyf7.southeastasia-01.azurewebsites.net',
};
