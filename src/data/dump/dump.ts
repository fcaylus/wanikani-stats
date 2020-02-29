import dumpVocabularies from "./dumpVocabularies";
import dumpKanjis from "./dumpKanjis";

/**
 * Dump all data from the different sources and save them in the sources/ directory
 */

console.log("Kanjis:");
dumpKanjis();

console.log("Vocabularies:");
dumpVocabularies();


