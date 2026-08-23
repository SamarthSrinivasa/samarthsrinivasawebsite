(function () {
  'use strict';

  // Imported from a Letterboxd data export (reviews.csv). Re-export and paste over this
  // array to refresh — see the comment at the bottom of this file for the format.
  var FILMS = [
    { name: 'Rounders', year: 1998, rating: 4.5, watched: '2024-12-23', review: `Absolutely wonderful movie, Matt Damon was great, John Malkovich was both ridiculous and surprisingly intimidating as a villain, and Edward Norton is the most underrated aspect of this film. I am now addicted to gambling` },
    { name: 'Oppenheimer', year: 2023, rating: 5, watched: '2023-08-02', review: `Breathtaking, masterful control over the history of these political events, even if mythologizing it somewhat. Excellent acting, gripping tension, pulsating score, a masterpiece of a movie.` },
    { name: 'Steve Jobs', year: 2015, rating: 4.5, watched: '2024-12-27', review: `Michael Fassbender does an amazing job transforming himself into jobs, to the point where I didn't even feel it was the actor himself, Kate Winslet felt like a wonderful view of how many in the audience would view Jobs as a follower of his grand ideas, Seth Rogen brought out the frustration that Woz that while made more cinematic, really captured how much Jobs screwed him over, and Jeff Daniels was easily the best part of the movie, his argument with jobs, with the orchestra ramping up in the background, was a masterclass of a scene. Amazing portrayals all around, and wonderful pacing and execution of the history of Apple and Jobs.` },
    { name: 'The Social Network', year: 2010, rating: 4.5, watched: '2024-11-15', review: `With a haunting piano score, outstanding acting, and a compelling depiction of human apathy and self-interest, the Social Network masterfully captures the social interactions of those on the brink of societal change.` },
    { name: 'Carry-On', year: 2024, rating: 3.5, watched: '2024-12-19', review: `Michael` },
    { name: 'Dune', year: 2021, rating: 4, watched: '2024-12-27', review: `Yeah its good` },
    { name: 'Dune: Part Two', year: 2024, rating: 4, watched: '2024-03-07', review: `yeah its good 2` },
    { name: 'Spider-Man: Across the Spider-Verse', year: 2023, rating: 5, watched: '2024-06-11', review: `if part 3 doesnt come out you better watch out Sony` },
    { name: 'Superman', year: 2025, rating: 4.5, watched: '2025-07-12', review: `I teared up 5 times, but I made it to the end. "Phew, almost got me", I thought as the final few scenes started to play. Then, Punkrocker Featuring Iggy Pop started playing as the final scene reached its conclusion, and my eyes burst with salty water without consent. Why do you always do this James Gunn why` },
    { name: 'Karate Kid: Legends', year: 2025, rating: 4, watched: '2025-07-01', review: `While I can clearly see this movie is not "objectively" one of the top movies of all time, there is something special about this final(?) entry in a long line of successful movies and TV shows this franchise has put out. A brand new story, almost reminiscent of Spiderman into the Spiderverse, shows a new backstory for who I truly consider my Karate Kid in the modern age (Sorry Miguel and Robby, Ben was just so cool). There is alot of hope and heart in this movie (similar to Superman (2025), despite this movie coming out first), and my heart longs to see more, but this entry ultimately leaves me satisfied and with a good taste in my heart.` },
    { name: 'Whiplash', year: 2014, rating: 5, watched: '2025-07-14', review: `i was in band this is accurate` },
    { name: 'Chef', year: 2014, rating: 4.5, watched: '2025-07-15', review: `someone cooked here` },
    { name: 'Mission: Impossible – Fallout', year: 2018, rating: 4.5, watched: '2025-07-14', review: `Best one of the series; Henry Cavill reloading his shotgun fists will never not be funny` },
    { name: 'Mission: Impossible – Dead Reckoning', year: 2023, rating: 3.5, watched: '2025-07-14', review: `Prretty good first half` },
    { name: 'Mission: Impossible – The Final Reckoning', year: 2025, rating: 3.5, watched: '2025-07-14', review: `pretty good second half` },
    { name: 'Weapons', year: 2025, rating: 4, watched: '2025-08-26', review: `Doesnt feel too much like horror, but really good mystery. Song choices were excellent, the cinematography blew me away, extremely enjoyable movie` },
    { name: 'Interstellar', year: 2014, rating: 4, watched: '2025-08-29', review: `One of Nolans better movies, he captures the atmosphere of space extremely well` },
    { name: 'Pulp Fiction', year: 1994, rating: 4, watched: '2025-09-01', review: `Whatever I expected at the start was not what I finished with, a very interesting story told in complex parts, some of which make sense and some that are left to interpretation, better or worse. There was alot I honestly disliked about the film (The scenes felt longer than they should have been, I enjoyed the scenes setting the tone, but it felt like they dragged on and broke the immersion of the story, among other general immersion-breaking scenes), but the style and charm of the directing/camera work, and the genuine delivery of masterful dialogue cannot be raved about enough, glad to see why this movie is so hyped up` },
    { name: 'The Suicide Squad', year: 2021, rating: 5, watched: '2025-09-02', review: `Yeah this movie is THAT good, Gunns BEST movie (yes even after watching superman), its so good` },
    { name: 'One Battle After Another', year: 2025, rating: 4, watched: '2025-10-07', review: `Plot: 5/10 - While the plot had some great elements to it, the overall story felt disjoint. The start helped establish the backstory, which was very strong, but once we were captivated with Teyana Taylors performance, she leaves the movie in IMO a very unsatisfying way. This leads to Leo having most of the scenes in the movie, where he honestly did not have the gravity or humor to match the rest of the casts acting and dramatic scenes. The French 75/White Christmas arc also felt very underdeveloped, and I would have liked fleshed-out scenes with at least more understanding of the history of both groups, and better conclusions for more of the members, it felt very half-baked with so many plot threads left, to the point where I assumed there would be a part 2 to this movie.

Acting: 7.5/10 - Leo felt very unconvincing as a "war" hero, bumbling around, which did add humor, but for my first real DiCaprio movie in theaters, I was pretty disappointed with how he was overshadowed by every other cast member, Del Toro was great as Sensei, Infiniti was amazing, I am really excited to see her in future stuff, Sean Penn was a wonderfully easy villain to hate, everyone was great, but coming into the movie assuming Leo was the draw, I was greatly disappointed.

Cinematography: 9/10 - Every shot was wonderful, every frame captured the emotion of the scene, I especially liked the desert scenes and the wide shots showing the scale of the mountains and the desert contrasting with the size of characters, definitely makes me want to look at more PTA movies.

Music: 10/10 - I cant believe this movie, out of every other movie Ive seen, had the best soundtrack. Its not music I would listen to in the car, at home, anywhere else, but it fit the emotional notes of the movie so well it was incomprehensible. The antsy piano during tense drawn-out scenes, the larger-than-life orchestra at pivotal moments, I just saw that Jonny Greenwood did the music and everything makes sense. Stunning stuff

Overall: 7.8/10 Good stuff` },
    { name: 'No Country for Old Men', year: 2007, rating: 4.5, watched: '2025-10-21', review: `The only thing that you hear is the howl of the wind in the desert, the sound of the town, gunshots, and dialogue. My face is blank as I type this, this movie makes me think of so much and at the same time so little. The howl of the wind in the desert night, but more so the stories and quirks of the older generation in this film, Ed Tom Bell (Tommy Lee Jones) and Ellis (Barry Corbin) remind me of my old Boy Scout elders, and a new fella I have just become aquatinted with, Keith, from my local chess club. Both having the same wistful tone about the people they have met over their long lives, their need to share that information with someone who will give a damn, that vulnerability that comes with hoping for the damn too. Brolin, Harrelson, Macdonald, Harper all play so well in creating this atmosphere of a world so lived in, impossibly similar to ours, but the elephant in the room, Chigurh, really casts a shadow (in the sense of presence) over this entire film, bringing that sense of dread, the inevitable confrontation he brings with everyone he interacts with, but in the final moments of the film showing his true mortality and failiabilty. The one emotion screaming at me after watching this film is to lament, of which I dont even know of what really, but I suppose it will make sense as I grow older. In many ways, this is the most nihilistic movie I have ever seen.` },
    { name: 'Chintane', year: 2025, rating: 5, watched: '2025-11-23', review: `The Letterboxd summary does not do this film justice. Excluding all the variables, from the time it took to shoot, the physical limitations of the equipment, the busy lives of everyone involved that were truly doing it for the love of the game rather than for pay, excluding all of that, this film is a masterpiece all by itself. Storytelling is a nuanced and delicate art, and it takes a true visionary to capture such vivid and complex emotions: grief, sorrow, relief, acceptance, all within the span of 5 minutes. The actors really feel ingrained in this universe, another unbelievable feat considering that I know these people in real life, including my own father, but while watching, I really felt as though he lived his whole life in this universe, and was really talking to his hypothetical grandson. On a personal level, seeing a film that was directed by someone from my culture and background be this excellent, rekindled my motivation for my many unfinished creative projects, which is invaluable, having art that is so powerful it evokes the feeling of motivation to create more like it. Similar to how I felt learning about Zohran Mamdanis' life, seeing creative excellence from fellow youth in this community gives me a certain type of confidence and pride that feels so incredibly rare. For a first film (that I have seen from people my age with my background and culture), I am at awe that it was a home run right off the bat. There is no greater point in making art than for making projects like this. Dhanyavadagalu.` },
    { name: 'Obsession', year: 2025, rating: 4.5, watched: '2026-06-07', review: `Why does this dude look like Charlie Kirk so much` },
    { name: 'The Mandalorian and Grogu', year: 2026, rating: 1.5, watched: '2026-06-05', review: `I love the Mangalorian!! and Baby Yodia!!!` },
    { name: 'Backrooms', year: 2026, rating: 3.5, watched: '2026-06-10', review: `Weirdest movie Ive ever seen I think, my friends hated it but I thought it was very very interesting

Some guy kept throwing popcorn at me tho` },
    { name: 'Ted', year: 2012, rating: 3.5, watched: '2026-06-26', review: `Quite Poignant we lowk locked in after the first 20%` },
    { name: 'Supergirl', year: 2026, rating: 3, watched: '2026-06-30', review: `After hearing so much hate for this movie, and the love I have for Gunn and this universe, I was very cautious, but I was pleasantly surprised by this movie! Defintely shaky and has a lot of flaws, but Supergirls character, her powers, her kindness, and the world building are all on point, without giving too much or making the universe overly saturated too early. Hot take but better than Ragnarok` },
    { name: 'Grimsby', year: 2016, rating: 3, watched: '2026-07-01', review: `Perfect to watch while sandwiched between two guys` },
    { name: 'The Odyssey', year: 2026, rating: 5, watched: '2026-07-19', review: `This DEI casting has gone too far everyone should be yellow because it was written by Homer` },
    { name: 'Evil Dead Burn', year: 2026, rating: 2, watched: '2026-07-19', review: `The drone shots were so so funny, also I had so much diarrhea but luckily it was just me and my 2 friends in the theater at 1 AM so I could shit my guts out in peace` },
    { name: 'The Wolf of Wall Street', year: 2013, rating: 4, watched: '2026-07-21', review: `Movie is great but not for me, Leo I think is an overrated actor lowk he's very good but I think he just doesn't do it for me` },
    { name: 'The Big Short', year: 2015, rating: 4.5, watched: '2026-07-21', review: `Would have gotten 5 stars if they radicalized you more by the end of the movie, please give us directions on starting a revolution or JUST SOME KIND OF ACTION PLEASE` },
    { name: "Molly's Game", year: 2017, rating: 2.5, watched: '2026-07-30', review: `The structure of this film feels like a worse Social Network, missed emotional moments, way too much telling and not showing, Sorkin Dialogue at its worst here. Was promised a movie with cool poker scenes and was very disappointed. Jessica Chastain was great in this tho` },
    { name: 'Spider-Man: Brand New Day', year: 2026, rating: 4, watched: '2026-08-02', review: `This movie does have the sauce, story, characters, I really loved it, especially the emotional beats (very bittersweet to see Spider-Man getting beaten down like hes technically supposed to but it still pulls on the heartstrings), but this movie did make me realize my biggest grip with superhero movies in the last few years, which is an obsession with having cinematic aura farming moments. I know that sounds counter intuitive at first, especially in this genre, where many of the past critics to movies have been not embracing a comic book feel, and Im so so happy that movies like this and Superman really lean into this style, but at the same time, these slow motion scenes with magnified saturation that looks like it was put through an AI filter doesnt do it for me, it makes the movie feel cheap and ugly in my opinion, and I feel like this movie had abit too many of those scenes, and it slightly pulled me out at many moments where I feel like I should have been more hyped instead. Other than that, had a blast, made my heart ache. Ouch` },
    { name: 'Lost Ladies', year: 2023, rating: 3.5, watched: '2026-08-08', review: `Simple Premise, executed pretty well, camera work was really good?? One dude be larping not having legs for the love of the game??` },
    { name: 'Incendies', year: 2010, rating: 5, watched: '2026-08-22', review: `:(` },
    { name: 'Sinners', year: 2025, rating: 4, watched: '2026-08-22', review: `Better than One Battle After Another but not by much, I honestly thought MBJ was too focused on and I enjoyed the plot with the Music alot more` }
  ];

  var LETTERBOXD_USERNAME = 'SamyTheSeal';
  var PREVIEW_LIMIT = 280;

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatDate(iso) {
    var d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function starsHtml(rating) {
    var pct = Math.max(0, Math.min(5, rating)) / 5 * 100;
    return (
      '<span class="stars-wrap" title="' + rating + ' / 5">' +
        '<span class="stars-bg">★★★★★</span>' +
        '<span class="stars-fg" style="width:' + pct + '%">★★★★★</span>' +
      '</span>'
    );
  }

  function reviewHtml(review) {
    var paragraphs = review.split(/\n\s*\n/).map(function (p) { return p.trim(); }).filter(Boolean);
    var flat = paragraphs.join(' ');
    var full = paragraphs.map(function (p) { return '<p>' + escapeHtml(p) + '</p>'; }).join('');
    var isLong = flat.length > PREVIEW_LIMIT;
    var previewText = isLong ? flat.slice(0, PREVIEW_LIMIT).replace(/\s+\S*$/, '') + '…' : flat;
    var preview = '<p>' + escapeHtml(previewText) + '</p>';

    if (!isLong) {
      return '<div class="film-review">' + full + '</div>';
    }

    return (
      '<div class="film-review" data-expanded="false">' +
        '<div class="film-review-preview">' + preview + '</div>' +
        '<div class="film-review-full" hidden>' + full + '</div>' +
        '<button type="button" class="read-more-btn">read more</button>' +
      '</div>'
    );
  }

  function filmCardHtml(film) {
    return (
      '<div class="film-card" data-title="' + escapeHtml(film.name.toLowerCase()) + '">' +
        '<div class="film-head">' +
          '<div class="film-title-row">' +
            '<span class="film-title">' + escapeHtml(film.name) + '</span>' +
            '<span class="film-year">' + film.year + '</span>' +
          '</div>' +
          starsHtml(film.rating) +
        '</div>' +
        '<div class="film-meta">watched ' + formatDate(film.watched) + '</div>' +
        (film.review ? reviewHtml(film.review) : '') +
      '</div>'
    );
  }

  function bindReadMore(container) {
    Array.prototype.forEach.call(container.querySelectorAll('.read-more-btn'), function (btn) {
      btn.addEventListener('click', function () {
        var card = btn.closest('.film-review');
        var expanded = card.getAttribute('data-expanded') === 'true';
        card.querySelector('.film-review-preview').hidden = !expanded;
        card.querySelector('.film-review-full').hidden = expanded;
        card.setAttribute('data-expanded', expanded ? 'false' : 'true');
        btn.textContent = expanded ? 'read more' : 'read less';
      });
    });
  }

  function render() {
    var listEl = document.getElementById('filmList');
    var statsEl = document.getElementById('filmsStats');
    var creditEl = document.getElementById('filmsCredit');
    if (!listEl) return;

    var sorted = FILMS.slice().sort(function (a, b) { return b.watched < a.watched ? -1 : b.watched > a.watched ? 1 : 0; });
    var avg = sorted.reduce(function (sum, f) { return sum + f.rating; }, 0) / sorted.length;

    if (statsEl) {
      statsEl.textContent = sorted.length + ' films logged · avg ' + avg.toFixed(1) + ' ★';
    }
    if (creditEl) {
      creditEl.href = 'https://letterboxd.com/' + LETTERBOXD_USERNAME + '/';
    }

    listEl.innerHTML = sorted.map(filmCardHtml).join('');
    bindReadMore(listEl);

    var searchEl = document.getElementById('filmsSearch');
    if (searchEl) {
      searchEl.addEventListener('input', function () {
        var q = searchEl.value.trim().toLowerCase();
        var cards = listEl.querySelectorAll('.film-card');
        var visible = 0;
        Array.prototype.forEach.call(cards, function (card) {
          var match = card.getAttribute('data-title').indexOf(q) !== -1;
          card.style.display = match ? '' : 'none';
          if (match) visible++;
        });
        var emptyEl = document.getElementById('filmsEmpty');
        if (emptyEl) emptyEl.style.display = visible ? 'none' : '';
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }

  // ---------- Refreshing this later ----------
  // Letterboxd → Settings → Import & Export → Export Your Data, then pull the rows out of
  // reviews.csv (Name, Year, Rating, Review, Watched Date) and rebuild the FILMS array above.
})();
