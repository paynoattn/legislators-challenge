import * as fs from 'fs-extra';
import * as jsYaml from 'js-yaml';

interface Representative {
  name: {
    first: string;
    last: string;
  }
  bio: {
    gender: string
  }
  terms: RepresentativeTerm[]
}

interface RepresentativeTerm {
  start: string;
  end: string;
}

const DATA = process.env.DATASET === 'historic' ? 'historic' : 'current';
const PATH = `${__dirname}/../static/${DATA}.yaml`;

const YEAR_FOUNDED = 1798;
const NUM_YEARS = Math.abs(new Date().getUTCFullYear() - YEAR_FOUNDED);
// array of all years to iterate over
const YEARS = [...Array.from(Array(NUM_YEARS))].map((_,i) => i + YEAR_FOUNDED);

const grabYamlFile = async (filename: string): Promise<Representative[]> => {
  const fileBuffer = await fs.readFile(PATH, 'utf8');
  return jsYaml.load(fileBuffer) as Representative[];
}

const createSlowHistogram = (representatives: Representative[]) => {
  YEARS.forEach(y => {
    const yearDate = new Date(`${y}/01/01`);
    const filtered = representatives.filter(r => r.bio.gender === 'F' && r.terms.find(t => isTermInYear(yearDate, t) ));
    console.log(y, filtered.length);
  })
}

const createHistogram = (representatives: Representative[]) => {
  // put all female representatives' terms in a single array
  const terms = representatives
    .filter(r => r.bio.gender === 'F')
    .flatMap(r => r.terms);

  // iterate over years
  YEARS.forEach(year => {
    // get current year in js date
    const yearDate = new Date(`${year}/01/01`);
    // Find all terms that took place in the year
    const filtered = terms.filter(t => isTermInYear(yearDate, t));
    console.log(year, filtered.length, '#'.repeat(filtered.length));
  })
}

const isTermInYear = (year: Date, term: RepresentativeTerm) =>
  year.getTime() >= new Date(term.start).getTime()  && year.getTime() <= new Date(term.end).getTime()

const bootstrap = async () => {
  const reps = await grabYamlFile('current.yaml');
  console.time('hist');
  createHistogram(reps);
  console.timeEnd('hist');
}

bootstrap()
  .then()
  .catch(e => console.error(e));
