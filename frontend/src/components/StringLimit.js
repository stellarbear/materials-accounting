import React from "react";
import { Popup } from 'semantic-ui-react';

const StringLimit = ({ limit = 50, text, popupHeader }) => {
  if (!text) return null;
  if (text.length < limit) {
    return text;
  } else {
    const words = text.split(' ');
    let wordsLength = 0;
    let index = 0;
    while (wordsLength < limit) {
      // Spaces between words
      if (index < words.length - 1) {
        wordsLength += 1;
      }
      // words length
      wordsLength += words[index].length;
      index += 1;
    }
    const newStringToRender = words.slice(0, index - 1).join(' ');
    return (
      <Popup
        header={popupHeader}
        content={text}
        wide='very'
        trigger={
          <span>{newStringToRender} ...</span>
        }
      />
    );
  }
};

export default StringLimit;