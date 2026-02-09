import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { Card } from '@openedx/paragon';

import createDOMPurify from 'dompurify';

import parse from 'html-react-parser';

import { selectors } from 'data/redux';
import { fileUploadResponseOptions } from 'data/services/lms/constants';

import SubmissionFiles from './SubmissionFiles';
import PreviewDisplay from './PreviewDisplay';

import './ResponseDisplay.scss';

/**
 * <ResponseDisplay />
 */
export class ResponseDisplay extends React.Component {
  constructor(props) {
    super(props);
    this.purify = createDOMPurify(window);
  }

  // eslint-disable-next-line react/no-unused-class-component-methods
  get textContents() {
    return this.props.response.text.map(text => parse(this.purify.sanitize(text)));
  }

  get submittedFiles() {
    return this.props.response.files;
  }

  get allowFileUpload() {
    return (
      this.props.fileUploadResponseConfig !== fileUploadResponseOptions.none
    );
  }

  get textResponses() {
    return this.props.response.text.map(text => parse(this.purify.sanitize(text)));
  }

  /* Extract prompts from oraMetadata */
  get prompts() {
    const rawPrompts = this.props.oraMetadata?.prompts || [];
    return rawPrompts.map(p => p.description || '');
  }

  /* Helper method to sanitizes and parse HTML strings */
  sanitizeAndParse = (html = '') => parse(this.purify.sanitize(html));

  render() {
    const { prompts, textResponses } = this;

    return (
      <div className="response-display">
        {this.allowFileUpload && <SubmissionFiles files={this.submittedFiles} data-testid="submission-files" />}
        {this.allowFileUpload && <PreviewDisplay files={this.submittedFiles} data-testid="allow-file-upload" />}

        {/* Multi-prompt ORA rendering */}
        {/* eslint-disable-next-line no-nested-ternary */}
        {prompts.length > 0 ? (
          prompts.map((prompt, i) => {
            const answer = textResponses[i] || '';
            const promptText = prompt || '<em>No prompt provided</em>';

            return (
              <>
                {/* eslint-disable-next-line react/no-array-index-key */}
                <Card key={i} className="my-5">

                  {/* Prompt header */}
                  <Card.Header title={<strong>Prompt {i + 1}</strong>} />

                  {/* Prompt content */}
                  <Card.Section
                    className="prompt-text"
                  > {this.sanitizeAndParse(promptText)}
                  </Card.Section>

                  {/* Learner response header */}
                  <Card className="mt-3" style={{ backgroundColor: '#f8f9fa' }}>
                    <Card.Header title={<strong style={{ fontSize: '1.1rem', color: '#343a40' }}> Learner Response </strong>} />

                    {/* Learner response content */}
                    <Card.Section className="response-display-text-content">
                      {answer || (
                        <em className="text-muted"> No response submitted for this prompt.</em>
                      )}
                    </Card.Section>
                  </Card>
                </Card>
              </>
            );
          })
        ) : (
        /* Fallback for single or no prompt scenarios */
          textResponses.length > 0 ? (
            textResponses.map((text, index) => (
              <>
                {/* eslint-disable-next-line react/no-array-index-key */}
                <Card key={index} className="my-3" style={{ padding: '1rem' }}>
                  <Card.Section>
                    {text || <em className="text-muted">No response submitted</em>}
                  </Card.Section>
                </Card>
              </>
            ))
          ) : (
            <em className="text-muted">No prompts or responses available.</em>
          )
        )}
      </div>
    );
  }
}

ResponseDisplay.defaultProps = {
  response: {
    text: [],
    files: [],
  },
  oraMetadata: { prompts: [] },
  fileUploadResponseConfig: fileUploadResponseOptions.none,
};
ResponseDisplay.propTypes = {
  response: PropTypes.shape({
    text: PropTypes.arrayOf(PropTypes.string),
    files: PropTypes.arrayOf(
      PropTypes.shape({
        fileName: PropTypes.string,
      }),
    ).isRequired,
  }),
  oraMetadata: PropTypes.shape({
    prompts: PropTypes.arrayOf(
      PropTypes.shape({
        description: PropTypes.string,
      }),
    ),
  }),
  fileUploadResponseConfig: PropTypes.oneOf(
    Object.values(fileUploadResponseOptions),
  ),
};

export const mapStateToProps = (state) => {
  const oraMetadata = selectors.app.oraMetadata(state);
  // eslint-disable-next-line no-console
  console.log('ORA METADATA:', selectors.app.oraMetadata(state));
  return {
    response: selectors.grading.selected.response(state),
    oraMetadata,
    fileUploadResponseConfig: selectors.app.ora.fileUploadResponseConfig(state),
  };
};

export const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(ResponseDisplay);
