import * as core from '@actions/core'
import {getTeamLabel} from './teams'
import {
  getPrNumber,
  getPrAuthor,
  getLabelsConfiguration,
  addLabels,
  createClient
} from './github'

async function run() {
  core.debug('Running the team labeler action')

  try {
    const token = core.getInput('repo-token', {required: true})
    const configPath = core.getInput('configuration-path', {required: true})

    const prNumber = getPrNumber()
    if (!prNumber) {
      core.debug('Could not get pull request number from context, exiting')
      return
    }

    core.debug(`prNumber: ${prNumber}`)

    const author = getPrAuthor()
    if (!author) {
      core.debug('Could not get pull request user from context, exiting')
      return
    }
    core.debug(`prAuthor: ${author}`)

    const client = createClient(token)
    const labelsConfiguration: Map<
      string,
      string[]
    > = await getLabelsConfiguration(client, configPath)

    core.debug(`labelsConfiguration: ${labelsConfiguration}`)

    const labels: string[] = getTeamLabel(labelsConfiguration, `@${author}`)

    core.debug(`labels: ${labels}`)

    if (labels.length > 0) await addLabels(client, prNumber, labels)

    core.debug('all done dude')
  } catch (error) {
    core.error(error)
    core.setFailed(error.message)
  }
}

run()
