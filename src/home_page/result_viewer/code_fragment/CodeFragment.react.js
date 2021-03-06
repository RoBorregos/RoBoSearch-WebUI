import React, {Component} from 'react';

import {GroupMatchesStruct} from 'home_page/ResultStruct.js';
import {computeSplitedAndHighlitedFragment} from 'home_page/result_viewer/code_fragment/FragmentFormatter.js';

import style from 'home_page/result_viewer/code_fragment/CodeFragment.module.css';

class RCodeFragment extends Component {
  /**
   * @param {!{data: !GroupMatchesStruct, onClickToOpen: function():undefined}} props
   */
	constructor(props) {
    super(props);
    this.onClickToOpen = this.onClickToOpen.bind(this);
  }

  onClickToOpen() {
    this.props.onClickToOpen();
  }

	render() {
    const data = this.props.data;

    // const divCodeLines = 
    //   data.fragment.split("\n").map((stringLine, index) => (       
    //     <pre key={index.toString()}>
    //       {stringLine}
    //     </pre>
    //   ));
    // TODO: Clone only the neccesary: fragment and matches.
    const dataClone = JSON.parse(JSON.stringify(data));
    const divCodeLines = computeSplitedAndHighlitedFragment(dataClone);

		return (
			<div className={style.parentDiv}>
        <div className={style.codeLinesDiv} onClick={this.onClickToOpen}>
          {divCodeLines}
        </div>

        <div className={style.footerDiv}>
          {data.fragment.split("\n").length} lines - {data.matches.length} appearances
        </div>
			</div>
		);
  }
}

export default RCodeFragment;
