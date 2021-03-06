import React, { Component } from 'react';

import RSecretView from 'home_page/secret_view/SecretView.react.js';
import RFileViewer from 'home_page/file_viewer/FileViewer.react';
import RResultViewer from 'home_page/result_viewer/ResultViewer.react.js';
import RTopBar from 'home_page/top_bar/TopBar.react.js';
import RErrorNotice from 'home_page/error_notice/ErrorNotice.react.js';
import {requestResults, checkQuery} from 'home_page/RequesterHelper.js';
import {Destinations, getDestinationFromURLParams} from 'home_page/Redirecter.js';
import {ResultStruct} from 'home_page/ResultStruct.js';

import style from 'home_page/HomePage.module.css';

/**
 * Note: This component does NOT update on props changes. It forever uses the first props
 * passed. At the beginning was because it was meant to be called only once each page load.
 * Now, is also because `RTopBar`'s default-props.
 * 
 * TODO: When the migration of the ResulViewer to its file finishes, change this to make
 * render correctly depend on props. Maybe using `getDerivedStateFromProps()` to make 
 * it cleaner.
 */
class RHomePage extends Component {
  /** @param {!{urlParams: !URLSearchParams}} props */
  constructor(props) {
    super(props);
    this.onClickResultToOpenFile = this.onClickResultToOpenFile.bind(this);

    const valuesFromURL = this.getValuesFromURL(props.urlParams);
    const destination = getDestinationFromURLParams(props.urlParams);
    /** @type {!{query: !string, onlyRobo: !boolean, expSearch: !boolean, queryResults: !Array<!ResultStruct>, errorInRequest: ?{error: ?string, rateLimit: !boolean}, actualDestination: !string}} */
    this.state = {
      ...valuesFromURL,
      queryResults: [],
      errorInRequest: null,
      actualDestination: destination,
    };
  }

  /**
   * @param {!string} owner
   * @param {!string} repo
   * @param {!string} file
   */
  onClickResultToOpenFile(owner, repo, file) {
    const url = new URL(window.location.origin + window.location.pathname);

    url.searchParams.set("q", this.state.query);
    url.searchParams.set("robo", this.state.onlyRobo);
    url.searchParams.set("exp", this.state.expSearch);
    url.searchParams.set("owner", owner);
    url.searchParams.set("repo", repo);
    url.searchParams.set("file", file);

    console.log("File at:" + url.toString());
    window.location.href = url.toString();
  }

  componentDidMount() {
    // TODO: Move the logic specific to results toResultViewer.
    if (this.state.actualDestination === Destinations.RESULTS) {
      const validQuery = checkQuery(this.state.query);
      this.setState({
        errorInRequest: validQuery ? null : {error: "Invalid query", rateLimit: false},
      });

      if (validQuery) {
        this.getResultsOfSearch(this.state.query, this.state.onlyRobo);
      }
    }
  }

  render() {
    let bodyContent;
    switch(this.state.actualDestination) {
      case Destinations.RESULTS: {
        bodyContent = this.state.errorInRequest === null ?
          <RResultViewer 
            results={this.state.queryResults} 
            onClickToOpenFile={this.onClickResultToOpenFile}
          /> :
          <RErrorNotice 
            error={this.state.errorInRequest.error} 
            rateLimit={this.state.errorInRequest.rateLimit} 
          />;
        console.log("Navigation= Results");
        break;
      }

      case Destinations.FILE_VIEWER: {
        bodyContent = <RFileViewer searchParams={this.props.urlParams} />;
        console.log("Navigation= File viewer");
        break;
      }

      // Destinations.HOME
      default: {
        bodyContent = <div />;
        console.log("Navigation= Home");
      }
    }
    if (this.props.urlParams.has("secrets")) {
      bodyContent = <RSecretView searchParams={this.props.urlParams}/>;
      console.log("Renavigation= Secrets");
    }

    return (
      <div className={style.parentDiv}>
        <div className={style.topDiv}>
          <RTopBar 
            defaultQuery={this.state.query} 
            defaultOnlyRoboRepos={this.state.onlyRobo} 
            defaultUseExpSearch={this.state.expSearch} 
          />
        </div>
        <div className={style.contentDiv}>
          {bodyContent}
        </div>
      </div>
    );
  }

  getValuesFromURL(urlParams) {
    const query = urlParams.get("q") || "";
    // TODO: Include here selecting the default values.
    const onlyRobo = urlParams.get("robo") !== "false";
    const expSearch = urlParams.get("exp") !== "false";

    const state = {query, onlyRobo, expSearch};
    console.log("Value from URL: ");
    console.log(state);

    return state;
  }

  /**
   * @param {!string} query
   * @param {!boolean} onlyRoboRepos 
   */
  getResultsOfSearch(query, onlyRoboRepos) { 
    if (query.replace(/\s/g, "").length > 0) {
      requestResults(query, onlyRoboRepos, (resposeObject) => {
        console.log(resposeObject);
        if (resposeObject.error === null) {
          this.setState({
            queryResults: resposeObject.results,
            errorInRequest: null,
          });
        } else {
          this.setState({
            errorInRequest: {
              error: resposeObject.error, 
              rateLimit: resposeObject.rateLimit,
            },
          });
        }
      });
    }
  }
}

export default RHomePage;
