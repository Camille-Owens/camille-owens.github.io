function FavoriteBook(title, author, publishDate, rating = 0, apiId) {
	this.title = title;
	this.author = author;
	this.publishDate = publishDate;
	this.rating = rating;
	this.apiId = apiId;

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
		listItem.innerHTML = `${this.title} by ${this.author} | Rating: ${this.rating}/5 `;

		let ratingEntry = document.createElement('input');
		ratingEntry.setAttribute('id', `${this.apiId}-rating-input`);
		ratingEntry.setAttribute('type', 'text');
		ratingEntry.setAttribute('placeholder', 'Enter Rating from 0 to 5');
		listItem.appendChild(ratingEntry);

		let unFavoriteButton = document.createElement('button');
		unFavoriteButton.setAttribute('id', `${this.apiId}-unfavorite-button`);
		unFavoriteButton.type = 'button';
		unFavoriteButton.innerHTML = 'Remove';
		listItem.appendChild(unFavoriteButton);

	}

	this.formatForStorage = () => {
		return {
			title: this.title,
			author: this.author,
			publishDate: this.publishDate,
			rating: this.rating,
			apiId: this.apiId
		}
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
		    			<div>
		    				<div id="${book.key}-book">${book.title} by ${book.author_name} </div>
		    			</div>
		    		`;
		    		let favoriteButton = document.createElement('button');
		    		favoriteButton.setAttribute('id', `${book.key}-button`);
		    		favoriteButton.type = 'button';
		    		favoriteButton.innerHTML = 'Favorite';
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
			let favoriteBook = new FavoriteBook(book.title, book.author_name, book.first_publish_year, 0, book.key);
			favoriteBooks.push(favoriteBook.formatForStorage());
			localStorage.setItem('favoriteBooks', JSON.stringify(favoriteBooks));
			this.updateFavoritesList();
		}
		//then we grey out the entry that has been moved to the favorites and remove the favorite button
		let button = document.getElementById(`${book.key}-button`)
		button.parentNode.removeChild(button);
		let bookEntry = document.getElementById(`${book.key}-book`).classList.add('favorited-search-result');
	}
	this.unFavorite = (book) => {
		let favoriteBooks = localStorage.getItem('favoriteBooks') != null ? JSON.parse(localStorage.getItem('favoriteBooks')) : [];
		if (favoriteBooks.length > 0) {
			let newFavoriteBooks = favoriteBooks.filter(b => b.key !== book.key);
			localStorage.setItem('favoriteBooks', JSON.stringify(newFavoriteBooks));
			this.updateFavoritesList();
		} else {
			return;
		}
	}
	this.updateFavoritesList = () => {
		let favoriteBooks = JSON.parse(localStorage.getItem('favoriteBooks'));

		let favoriteBooksList = document.querySelector('#favorite-books-list');
		favoriteBooksList.innerHTML = '';

		if (favoriteBooks.length === 0) {
			favoriteBooksList.innerHTML = '<p>No Favorite Books</p>';
		} else {
			for (i = 0; i < favoriteBooks.length; i++) {
				let bookEntry = favoriteBooks[i];
				console.log('bookEntry', bookEntry);
				//make each entry from localStorage a book object so it is easier to display and has the right information
				let Book = new FavoriteBook(bookEntry.title, bookEntry.author, bookEntry.publishDate, bookEntry.rating, bookEntry.apiId);
				favoriteBooksList.innerHTML += `
					<div>
						<div id="${Book.apiId}-favorite-book"></div>
					</div>
				`;
				Book.display();

				// we add the events out here because we only want to do them once
				document.body.addEventListener('click', (e) => {
					if (e.target && e.target.id == `${Book.apiId}-unfavorite-button`) {
						console.log('in the right click event');
						//in this case, 'this' is the BookSearch object
						this.unFavorite(bookEntry);
					}
				});
				document.body.addEventListener('change', (e) => {
					if (e.target && e.target.id == `${Book.apiId}-rating-input`) {
						Book.setRating(e.target.value);
					}
				})
			}
		}
	}

}

let bookSearch = new BookSearch();
bookSearch.updateFavoritesList();
























