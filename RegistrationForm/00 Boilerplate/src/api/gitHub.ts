class GitHub {
  doesUsernameExists(username: string): Promise<boolean> {
    const baseGitHubUsersUrl = 'https://api.github.com/users/';
    const fetchGitHubUserUrl = baseGitHubUsersUrl + username;

    return fetch(fetchGitHubUserUrl)
      .then((response) => this.checkStatus(response))
      .then((response) => this.parseJSON(response))
      .then((data) => this.resolveUsernameFound(data))
      .catch((error) => this.resolveUsernameNotFound(error));
  }

  private checkStatus(response: Response): Promise<Response> {
    if (response.status >= 200 && response.status < 300) {
      return Promise.resolve(response);
    } else {
      throw new Error(response.statusText);
    }
  }

  private parseJSON(response: Response): any {
    return response.json();
  }

  private resolveUsernameFound(data: any): Promise<boolean> {
    return Promise.resolve(true);
  }

  private resolveUsernameNotFound(error: Error): Promise<boolean> {
    return Promise.resolve(false);
  }
}

export const gitHub = new GitHub();
