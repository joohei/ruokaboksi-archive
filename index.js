const data = await fetch("./data.json").then((resp) => resp.json());

const config = await fetch("./config.json").then((resp) => resp.json());

/*
A recipe object.
render() renders elements to the HTML document.
*/

class Recipe {
  constructor(major, minor) {
    this.major = parseInt(major);
    this.minor = parseInt(minor);
    this.data = data[major][minor];

    this.name = this.data["name"];
    this.tags = this.data["tags"];
    this.star = this.data["rate"];
    this.order = 5 - this.star;

    this.head = document.createElement("h1");
    this.head.innerText = `${major}.${minor}: ${this.name}`;

    this.img = new Image();
    this.img.src = `photos/${major}_${minor}.webp`;
    this.img.alt = "";
    this.img.onclick = () => {
      window.open(`OneDrive/photos/${major}_${minor}.jpg`, "_blank");
    };

    this.footer = document.createElement("div");
    this.footer.className = "footer";

    this.rate = document.createElement("span");
    this.rate.innerHTML = "&#9733;".repeat(this.star) + "&#9734;".repeat(5 - this.star);

    this.cart = new Image();
    this.cart.src = "cart.jpg";
    this.cart.alt = "";
    this.cart.className = "cart";
    this.cart.onclick = () => {
      window.open(`ingredients/${major}_${minor}.txt`, "_blank")
    };

    this.footer.appendChild(this.rate);
    this.footer.appendChild(this.cart);

    this.item = document.createElement("div");
    this.item.className = "recipe";
    this.item.style.order = this.order;

    this.item.appendChild(this.head);
    this.item.appendChild(this.img);
    this.item.appendChild(this.footer);
  }

  render(container) {
    container.appendChild(this.item);
  }
}

/*
A filter object.
toggle() is an onclick function for filter checkboxes.
render() renders elements to the HTML document.
*/

class Filter {
  constructor(name) {
    this.name = name;
    this.state = false;
    this.active = { true: false, false: false };

    this.input = document.createElement("input");
    this.input.type = "checkbox";
    this.input.name = name;
    this.input.id = name;
    this.input.onchange = () => {
      this.toggle();
    };

    this.label = document.createElement("label");
    this.label.for = name;
    this.label.innerText = name;

    this.item = document.createElement("div");
    this.item.className = "filter";
    this.item.onclick = () => {
      this.input.click();
    };
    this.item.appendChild(this.label);
    this.item.appendChild(this.input);
  }

  search() {
    for (let recipe of recipes) {
      if (filters.filter((filter) => filter.active[false]).every((filter) => recipe.tags.some((tag) => filter.name === tag))) {
        recipe.item.style.display = "grid";
      } else {
        recipe.item.style.display = "none";
      }
      if (filters.filter((filter) => filter.active[true]).some((filter) => recipe.tags.some((tag) => filter.name === tag)))
        recipe.item.style.display = "none";
    }
  }

  toggle() {
    this.active[this.state] = !this.active[this.state];
    this.search();
    this.update();
  }

  reset(state) {
    this.state = state;
    this.toggle();
  }

  update() {
    this.input.checked = this.active[this.state];
  }

  render(container) {
    container.appendChild(this.item);
  }
}

function searchFilters(keyword) {
  const searchQuery = keyword.toLowerCase();

  for (let filter of filters) {
    if (filter.name.includes(searchQuery)) {
      filter.item.style.display = "flex";
    } else {
      filter.item.style.display = "none";
    }
  }
}

/*
Creating all the recipes in the data.
This is based on the data in 'data.json'.
This also renders them into the webpage.
*/

let recipes = new Array();
const gallery = document.querySelector(".gallery");

for (let major in data) {
  for (let minor in data[major]) {
    let recipe = new Recipe(major, minor);
    recipes.push(recipe);
    recipe.render(gallery);
  }
}

/*
Creating all the filters in the filter menu.
This is based on the filters defined in 'config.json'.
This also renders them into the webpage.
*/

let filters = new Array();
const menu = document.querySelector(".menu");

for (let name of config["ingredients"]) {
  let filter = new Filter(name);
  filters.push(filter);
  filter.render(menu);
}

const sortSelector = document.querySelector("#sort");

sortSelector.onchange = (event) => {
  if (event.target.value === "rate") {
    for (let recipe of recipes) {
      recipe.order = 5 - recipe.star;
    }
  } else if (event.target.value === "new") {
    for (let recipe of recipes) {
      recipe.order = -(4 * (recipe.major - 1) + recipe.minor);
    }
  } else {
    for (let recipe of recipes) {
      recipe.order = 4 * (recipe.major - 1) + recipe.minor;
    }
  }
  for (let recipe of recipes) {
    console.log(recipe.order);
    recipe.item.style.order = recipe.order;
  }

}

/*
Listening for users search input in the filter menu.
Any change will look for matches.
*/

const searchInput = document.querySelector("#search");

searchInput.onkeyup = () => {
  searchFilters(searchInput.value);
};

const slider = document.querySelector(".hidden");

slider.onchange = () => {
  for (let filter of filters) {
    filter.state = !filter.state;
    filter.input.checked = filter.active[slider.checked];
  }
};

const clearButton = document.querySelector(".clear");

clearButton.onclick = () => {
  searchInput.value = "";
  searchFilters("");

  for (let filter of filters) for (let state in filter.active) if (filter.active[state]) filter.reset(state);

  if (slider.checked) {
    slider.click();
  }
};

const hamburgerButton = document.querySelector(".hamburger");
const bars = document.querySelectorAll(".bar");

hamburgerButton.onclick = () => {
  hamburgerButton.classList.toggle("active");
  menu.classList.toggle("active");
  bars.forEach((bar) => bar.classList.toggle("active"));

  if (gallery.style.display === "none") {
    gallery.style.display = "grid";

    setTimeout(() => {
      searchInput.value = "";
      searchFilters("");
    }, 300);
  } else {
    setTimeout(() => {
      gallery.style.display = "none";
    }, 300);
  }
};
