import React from 'react';

const About = () => (
  <div>
      <ul>
        <li>
          <a href='https://github.com/hryanjones/kyakarun/issues'>Report issues</a>
        </li>
        <li>
          Send feedback via <a href='https://twitter.com/hryanjones'>twitter</a> or <a href='mailto://hryanjones@gmail.com'>email</a>
        </li>
        <li>
          <a href='https://github.com/hryanjones/kyakarun'>Code</a>
        </li>
      </ul>
      <hr/>
      <h3>What is this?</h3>
      <p>
        <em>Kya Karun</em> is a simple web-app to help you decide what to do. You enter a number of activities and the amount of time they're good for, then you tell the app how much time you have and it'll suggest an activity randomly.
      </p>

      <h3>Where is my data stored?</h3>
      <p>
        Currently, this simple app stores everything in <a href='https://en.wikipedia.org/wiki/Web_storage#localStorage'>browser local storage</a>.
      </p>

      <h3>Why?</h3>
      <p>
        Every time I pulled out my phone I would waste time on Twitter, which wouldn't make me happy. In the vein of <a href='http://www.timewellspent.io/'>time well spent</a> I made this app to help me make better decisions with my time, steering me towards activities like studying Hindi, meditating, exercising, or reading a book, and ideally to a more fulfilled life.
      </p>

      <h3>Why is it called <em>Kya Karun</em>?</h3>

      <p>
        <em>Kya Karun</em> means "What should I do?" in Hindi.
      </p>
    </div>
);

export default About;


