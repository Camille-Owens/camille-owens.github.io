
let Book = {
	test: () => {
		console.log('got this happening');
	},
	search: function() {
		let searchInfo = document.querySelector('#book-search').value;
		let search = new XMLHttpRequest();
		let apiUrl = `http://openlibrary.org/search.json?q=${encodeURIComponent(searchInfo)}&page=1`;
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
		    				//in this case, 'this' is the Book object
		    				this.favorite(book);
		    			}
					});
		    	}
		    }
		}
	},
	favorite: function(book) {
		let favoriteBooks = localStorage.getItem('favoriteBooks') != null ? JSON.parse(localStorage.getItem('favoriteBooks')) : [];

		favoriteBooks.push(book);
		localStorage.setItem('favoriteBooks', JSON.stringify(favoriteBooks));
		this.updateFavorites();
	},
	updateFavorites: function() {
		let favoriteBooks = JSON.parse(localStorage.getItem('favoriteBooks'));

		let favoriteBooksList = document.querySelector('#favorite-books-list');
		favoriteBooksList.innerHTML = '';

		if (!favoriteBooks) {
			favoriteBooksList.innerHTML = '<p>No Favorite Books</p>';
		} else {
			for (i = 0; i < favoriteBooks.length; i++) {
				let book = favoriteBooks[i];
	    		favoriteBooksList.innerHTML += `
	    			<div>
	    				<div id="${book.key}-book">${book.title} by ${book.author_name} </div>
	    			</div>
	    		`;
			}
		}
	}

}

Book.updateFavorites();
























