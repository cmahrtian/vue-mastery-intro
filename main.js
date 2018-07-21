var eventBus = new Vue();

Vue.component("product", {
  props: {
    premium: {
      type: Boolean,
      required: true
    },
    cart: Array,
    reviews: Array
  },
  template: `
    <div class="product">
      
      <div class="product-image">
        <img :src="image">
      </div>

      <div class="product-info">
              
        <h1>{{ title }}</h1>
        
        <info-tabs :shipping="shipping"
          :inStock="inStock"
          :premium="premium"
          :details="details">
        </info-tabs>
        
        <h2>Colors</h2>
        <div class="color-box"
          v-for="(variant, index) in variants" 
          :key="variant.variantId"
          :style="{ backgroundColor: variant.variantColor }"
          @mouseover="updateProduct(index)"
          >
        </div>

        <button v-on:click="addToCart"
          :disabled="!inStock"
          :class="{ disabledButton: !inStock }">
          Add To Cart
        </button>
        
        <product-tabs :reviews="reviews"></product-tabs>
      </div>
    </div>
  `,
  data() {
    return {
      product: "Socks",
      brand: "Vue Mastery",
      selectedVariant: 0,
      onSale: false,
      details: ["80% cotton", "20% polyester", "Gender-neutral"],
      variants: [
        {
          variantId: 2234,
          variantColor: "green",
          variantImage: "./assets/vmSocks-green.jpeg",
          variantQuantity: 15
        },
        {
          variantId: 2235,
          variantColor: "blue",
          variantImage: "./assets/vmSocks-blue.png",
          variantQuantity: 0
        }
      ]
    };
  },
  mounted() {
    eventBus.$on("review-submitted", productReview => {
      this.reviews.push(productReview);
    });
  },
  methods: {
    addToCart() {
      this.$emit("add-to-cart", this.variants[this.selectedVariant].variantId);
    },
    updateProduct(index) {
      this.selectedVariant = index;
    }
  },
  computed: {
    title() {
      return this.brand + " " + this.product;
    },
    image() {
      return this.variants[this.selectedVariant].variantImage;
    },
    inStock() {
      return this.variants[this.selectedVariant].variantQuantity > 0
        ? true
        : false;
    },
    shipping() {
      return this.premium ? "Free" : "2.99";
    }
  }
});

Vue.component("info-tabs", {
  template: `
    <div>
      <ul>
        <span class="tab"
          v-for="(tab, index) in tabs"
          :key="index"
          @click="selectedTab = tab"
          :class="{ activeTab: selectedTab === tab }"
          >{{ tab }}</span>
      </ul>

      <div v-show="selectedTab === 'Shipping'">
        <p>Shipping: {{ shipping }}</p>
        <p v-if="inStock">In Stock</p>
        <p v-else>Out of Stock</p>
      </div>

      <product-details :premium="premium"
        :details="details"
        v-show="selectedTab === 'Details'">
      </product-details>
    </div>
  `,
  props: {
    shipping: String,
    inStock: Boolean,
    premium: Boolean,
    details: Array
  },
  data() {
    return {
      tabs: ["Shipping", "Details"],
      selectedTab: "Shipping"
    };
  }
});

Vue.component("product-details", {
  props: {
    premium: {
      type: Boolean,
      required: true
    },
    details: {
      type: Array
    }
  },
  template: `
    <div>
      <h2>Details</h2>
      <ul class="details">
        <li v-for="detail in details">{{ detail }}</li>
      </ul>
    </div>
  `
});

Vue.component("product-tabs", {
  template: `
    <div>
      <ul>
        <span class="tab"
          v-for="(tab, index) in tabs"
          :key="index"
          @click="selectedTab = tab"
          :class="{ activeTab: selectedTab === tab }"
          >{{ tab }}</span>
      </ul>

      <div v-show="selectedTab === 'Reviews'">
        <p v-if="!reviews.length">There are no reviews yet.</p>
        <ul>
          <li v-for="review in reviews">
            <p>{{ review.name }}</p>
            <p>Rating: {{ review.rating }}</p>
            <p>{{ review.review }}</p>
            <p>{{ review.recommendation }}</p>
          </li>
        </ul>
      </div>

      <div v-show="selectedTab === 'Make a Review'">
        <product-review></product-review>
      </div>  
    </div>
  `,
  data() {
    return {
      tabs: ["Reviews", "Make a Review"],
      selectedTab: "Reviews"
    };
  },
  props: {
    reviews: {
      type: Array,
      required: false
    }
  }
});

Vue.component("product-review", {
  template: `
    <form class="review-form" @submit.prevent="onSubmit">
      <p v-if="errors.length">
        <b>Please correct the following error(s):</b>
        <ul>
          <li v-for="error in errors">{{ error }}</li>
        </ul>
      </p>  
    
      <p>
        <label for="name">Name:</label>
        <input id="name" v-model="name" placeholder="name">
      </p>

      <p>
        <label for="review">Review:</label>
        <textarea id="review" v-model="review"></textarea>
      </p>

      <p>
        <label for="rating">Rating:</label>
        <select id="rating" v-model.number="rating">
          <option>5</option>
          <option>4</option>
          <option>3</option>
          <option>2</option>
          <option>1</option>
        </select>
      </p>

      <p>
        <label for="recommendation">Would you recommend this product?</label><br><br>
        Yes<input type="radio" name="recommendation" v-model="recommendation" value="yes">
        No<input type="radio" name="recommendation" v-model="recommendation" value="no">
      </p>

      <p>
        <input type="submit" value="Submit">
      </p>
    </form>  
  `,
  data() {
    return {
      name: null,
      review: null,
      rating: null,
      recommendation: null,
      errors: []
    };
  },
  methods: {
    onSubmit() {
      if (this.name && this.review && this.rating) {
        let productReview = {
          name: this.name,
          review: this.review,
          rating: this.rating,
          recommendation: this.recommendation
        };
        eventBus.$emit("review-submitted", productReview);
        this.name = null;
        this.review = null;
        this.rating = null;
        this.recommendation = null;
        this.errors = [];
      } else {
        this.errors = [];
        if (!this.name) this.errors.push("Name required.");
        if (!this.review) this.errors.push("Review required.");
        if (!this.rating) this.errors.push("Rating required.");
        if (!this.recommendation) this.errors.push("Recommendation required.");
      }
    }
  }
});

var app = new Vue({
  el: "#app",
  data: {
    premium: true,
    cart: [],
    reviews: []
  },
  methods: {
    updateCart(id) {
      this.cart.push(id);
    },
    removeFromCart(id) {
      if (this.cart.indexOf(id) > -1) {
        this.cart.splice(this.cart.indexOf(id), 1);
      }
    }
  }
});
