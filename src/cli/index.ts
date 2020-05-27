import * as path from 'path';
import * as R from 'ramda';
import * as YAML from 'yaml';
import mkdirp from 'mkdirp';
import { prompt, Answers } from 'inquirer';
import { readFileSync, writeFileSync } from 'fs';
import { askQuestions, Question } from './questions';
import { Kind, QUESTION_RELEVANCE_MAPPING } from './mappings';

/**
 * Used as a prefix in k8s manifest.
 */
const APP_NAME = 'pubsub-filter';
/**
 * Name of the k8s manifest file.
 */
const MANIFEST_FILE_NAME = `pubsub-filter.yml`;
/**
 * List of all
 */
const YAML_LIST: Kind[] = ['deployment', 'configmap', 'hpa'];

const getYamlAsJSON = (templateName: string): object =>
  YAML.parse(
    readFileSync(
      path.resolve(__dirname, './templates', `${templateName}.yml`),
    ).toString(),
  );

const applyAnswers = (answers: Answers) => async (
  templateName: Kind,
): Promise<string> =>
  YAML.stringify(
    R.reduce(
      (result: object, question: Question) =>
        R.reduce(
          (result: object, path: (number | string)[]) =>
            R.assocPath(path, answers[question], result),
          result,
        )(QUESTION_RELEVANCE_MAPPING[question][templateName]),
      getYamlAsJSON(templateName),
    )(R.keys(answers) as any), // ¯\_(ツ)_/¯
  );

const main = async (process: NodeJS.Process) => {
  try {
    const answers = await askQuestions(prompt, { appName: APP_NAME });
    const config = readFileSync(answers.FILTER_CONFIG).toString('base64');
    const processConfig = applyAnswers({
      ...answers,
      APP_NAME: `${answers.APP_NAME}-${APP_NAME}`,
      PROJECT_ID: `eu.gcr.io/${answers.PROJECT_ID}/pubsub-filter:latest`,
      FILTER_CONFIG: config,
    });
    const jsonObjects = await Promise.all(YAML_LIST.map(processConfig));
    const resultYAML = jsonObjects.join('---\n');
    const outputDir = path.resolve(process.cwd(), answers.OUTPUT_DIR);
    const absoluteFilePath = path.resolve(outputDir, MANIFEST_FILE_NAME);

    // create nested directories if don't exist
    await mkdirp(outputDir);
    // create YAML manifest
    writeFileSync(absoluteFilePath, resultYAML);

    process.exit(0);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
};

if (require.main === module) {
  main(process);
}
