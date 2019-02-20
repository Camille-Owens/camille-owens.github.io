function FavoriteBook(title, author, publishDate, rating = 0, apiId, haveRead = false) {
	this.title = title;
	this.author = author;
	this.publishDate = publishDate;
	this.rating = rating;
	this.apiId = apiId;
	this.haveRead = haveRead;

	this.setRating = (rating) => {
		if (!rating) {
			return;
		}
		if (rating > 5 || rating < 0) {
			window.alert('That is an invalid rating');
			return;
		}
		this.rating = rating;
		this.display();
	}

	this.display = () => {
		let listItem = document.getElementById(`${this.apiId}-favorite-book`)
		listItem.innerHTML = `<div><span class="favorite-book-title">${this.title} by ${this.author}<span class="badge">${this.rating}/5</span></span></div>`;

		let ratingEntry = document.createElement('input');
		ratingEntry.setAttribute('id', `${this.apiId}-rating-input`);
		ratingEntry.setAttribute('type', 'text');
		ratingEntry.setAttribute('placeholder', '0 - 5');
		ratingEntry.classList.add('rating-input');
		listItem.appendChild(ratingEntry);

		let unFavoriteButton = document.createElement('button');
		unFavoriteButton.setAttribute('id', `${this.apiId}-unfavorite-button`);
		unFavoriteButton.type = 'button';
		unFavoriteButton.innerHTML = 'Remove';
		unFavoriteButton.classList.add('btn-secondary');
		listItem.appendChild(unFavoriteButton);

		let haveReadButton = document.createElement('button');
		haveReadButton.setAttribute('id', `${this.apiId}-read-button`);
		haveReadButton.type = 'button';
		haveReadButton.innerHTML = this.haveRead ? 'Have Read' : 'To Read';
		haveReadButton.classList.add('btn-info');
		if (this.haveRead) {
			haveReadButton.classList.add('have-read');
		}
		listItem.appendChild(haveReadButton);

	}

	this.formatForStorage = () => {
		return {
			title: this.title,
			author: this.author,
			publishDate: this.publishDate,
			rating: this.rating,
			apiId: this.apiId,
			haveRead: this.haveRead
		}
	}

	this.read = () => {
		this.haveRead = !this.haveRead;
		let bookItem = document.getElementById(`${this.apiId}-read-button`);
		bookItem.classList.toggle('have-read');

		document.getElementById(`${this.apiId}-read-button`).innerHTML = this.haveRead ? 'Have Read' : 'To Read';

		bookSearch.updateFavorite(this);
	}
}


function BookSearch() {
	this.test = () => {
		console.log('got this happening');
	}
	this.search = () => {
		let searchInfo = document.querySelector('#book-search').value;
		let search = new XMLHttpRequest();
		let apiUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(searchInfo)}&page=1`;
		search.open('GET', apiUrl, true);
		search.send();

		search.onload = () => {
		    let bookData = JSON.parse(search.responseText);
		    document.querySelector('#search-results').classList.remove('hidden')
		    document.querySelector('#search-value').innerHTML = searchInfo;

		    let searchResults = document.querySelector('#search-results-list');
		    searchResults.innerHTML = '';
		    if (bookData.numFound < 1) {
		    	// no results found
		    	searchResults.innerHTML = '<p>No Results Found</p>';
		    } else {
		    	//for ease of reading, I'm only going to print out the first 10 results
		    	for (i = 0; i < 10 && i < bookData.numFound; i++) {
		    		let book = bookData.docs[i];
		    		searchResults.innerHTML += `
	    				<div id="${book.key}-book" class="search-result"><span class="search-result-title">${book.title} by ${book.author_name}</span></div>
		    		`;
		    		let favoriteButton = document.createElement('button');
		    		favoriteButton.setAttribute('id', `${book.key}-button`);
		    		favoriteButton.type = 'button';
		    		favoriteButton.innerHTML = 'Favorite';
		    		favoriteButton.classList.add('btn-primary')
		    		document.getElementById(`${book.key}-book`).appendChild(favoriteButton);

		    		// okay, so I copied this from Stack Overflow because my click event wasn't working, and I wanted to explain what it is doing so that you know
		    		// I understand. So, because I was dynamically creating the button, the click event was not connecting to the button. Because of this, I am using
		    		// Javascript's ability to 'bubble' events and watching the body for a click event. I am then checking the event to make sure that it is the
		    		// button that I want (by checking the id) before proceeding.
		    		document.body.addEventListener('click', (e) => {
		    			if (e.target && e.target.id == `${book.key}-button`) {
		    				//in this case, 'this' is the BookSearch object
		    				this.favorite(book);
		    			}
					});
		    	}
		    }
		}
	}
	this.favorite = (book) => {
		//first we update the favorites
		let favoriteBooks = localStorage.getItem('favoriteBooks') != null ? JSON.parse(localStorage.getItem('favoriteBooks')) : [];

		let foundBook = favoriteBooks.filter(b => b.apiId === book.key);
		if (foundBook.length > 0) {
			return;
		} else {
			let favoriteBook = new FavoriteBook(book.title, book.author_name, book.first_publish_year, 0, book.key, false);
			favoriteBooks.push(favoriteBook.formatForStorage());
			localStorage.setItem('favoriteBooks', JSON.stringify(favoriteBooks));
			// this.updateFavoritesList();
		}
		//then we grey out the entry that has been moved to the favorites and remove the favorite button
		let button = document.getElementById(`${book.key}-button`)
		button.parentNode.removeChild(button);
		let bookEntry = document.getElementById(`${book.key}-book`).classList.add('favorited-search-result');
		// then we show the badge on the Favorites nav link
		document.querySelector('.badge').classList.remove('hidden');
	}
	this.unFavorite = (book) => {
		console.log('unfavorite');
		let favoriteBooks = localStorage.getItem('favoriteBooks') != null ? JSON.parse(localStorage.getItem('favoriteBooks')) : [];
		if (favoriteBooks.length > 0) {
			console.log('bookslength');
			let newFavoriteBooks = favoriteBooks.filter(b => b.apiId !== book.apiId);
			localStorage.setItem('favoriteBooks', JSON.stringify(newFavoriteBooks));
			this.updateFavoritesList();
		} else {
			return;
		}
	}
	this.updateFavorite = (Book) => {
		//first we update the favorites
		let favoriteBooks = localStorage.getItem('favoriteBooks') != null ? JSON.parse(localStorage.getItem('favoriteBooks')) : [];

		let foundBook = favoriteBooks.filter(b => b.apiId === Book.apiId);
		if (foundBook.length < 1) {
			return;
		} else {
			let updatedFavoriteBooks = favoriteBooks.map(b => {
				if (b.apiId === Book.apiId) {
					b = Book.formatForStorage();
				}
				return b;

			});
			console.log('updatedFavoriteBooks', updatedFavoriteBooks);
			// updatedFavoriteBooks.push(Book.formatForStorage());
			localStorage.setItem('favoriteBooks', JSON.stringify(updatedFavoriteBooks));
			// this.updateFavoritesList();
		}
	}
	this.updateFavoritesList = () => {
		let favoriteBooks = localStorage.getItem('favoriteBooks') != null ? JSON.parse(localStorage.getItem('favoriteBooks')) : [];

		let favoriteBooksList = document.querySelector('#favorite-books-list');
		favoriteBooksList.innerHTML = '';

		if (favoriteBooks.length === 0) {
			favoriteBooksList.innerHTML = '<p>No Favorite Books</p>';
		} else {
			for (i = 0; i < favoriteBooks.length; i++) {
				let bookEntry = favoriteBooks[i];
				console.log('bookEntry', bookEntry);
				//make each entry from localStorage a book object so it is easier to display and has the right information
				let Book = new FavoriteBook(bookEntry.title, bookEntry.author, bookEntry.publishDate, bookEntry.rating, bookEntry.apiId, bookEntry.haveRead);
				favoriteBooksList.innerHTML += `
					<div id="${Book.apiId}-favorite-book" class="favorite-result"></div>
				`;
				Book.display();

				// we add the events out here because we only want to do them once
				document.body.addEventListener('click', (e) => {
					if (e.target && e.target.id == `${Book.apiId}-unfavorite-button`) {
						console.log('in the right click event');
						//in this case, 'this' is the BookSearch object
						this.unFavorite(Book);
					}
				});
				document.body.addEventListener('change', (e) => {
					if (e.target && e.target.id == `${Book.apiId}-rating-input`) {
						Book.setRating(e.target.value);
						this.updateFavorite(Book);
					}
				})

				document.body.addEventListener('click', (e) => {
					if (e.target && e.target.id == `${Book.apiId}-read-button`) {
						Book.read();
					}
				})
			}
		}
	}

}

let bookSearch = new BookSearch();
// bookSearch.updateFavoritesList();
























