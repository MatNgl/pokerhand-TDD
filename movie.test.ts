const { expect } = require("chai");

const MOVIE_COLLECTION = [
  {
    title: "The Matrix",
    year: 1999,
  },
  {
    title: "A beautiful mind",
    year: 2001,
  },
  {
    title: "Intouchable",
    year: 2011,
  },
  {
    title: "Forest Gump",
    year: 1994,
  },
];

function getMovieByTitle(title: string) {
  const movie = MOVIE_COLLECTION.filter((movie) => movie.title.toLowerCase().replace(/ /g,'') === title.toLowerCase().replace(/ /g,''));
  return movie.length > 0 ? movie : { error: "not found" };
}


describe("movies", () => {
  it("should return the movie with the title", () => {
    expect(getMovieByTitle("Intouchable")).to.deep.equal([{
      title: "Intouchable",
      year: 2011,
    }]);
  })

    it("should return the movie with the title without capital", () => {
    expect(getMovieByTitle("forest Gump")).to.deep.equal([{
    title: "Forest Gump",
    year: 1994,
    }]);
  })

    it("should return the movie with the title with no space", () => {
    expect(getMovieByTitle("forestGump")).to.deep.equal([{
    title: "Forest Gump",
    year: 1994,
    }]);
  })

    it("should get an error", () => {
    expect(getMovieByTitle("kfkfld")).to.deep.equal({error : "not found"});
  });
});