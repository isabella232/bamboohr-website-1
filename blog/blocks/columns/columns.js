import { hasClassStartsWith, getValuesFromClassName } from '../../scripts/scripts.js';

function buildSplit(splitVal) {
  const newCol = document.createElement('div');
  newCol.classList.add(`column${splitVal}`);
  return newCol;
}

function findSplitSubType(val) {
  let isSplitSubType = false;
  let splitVals = null;
  // Looking for sub types like: 8-4, 6-6, 3-9, 2-10, 2-5-3-2, or 4-8-4
  if (val?.length < 12 && val?.includes('-')) {
    splitVals = val.split('-');
    // Make sure all splitVals are 1-2 digit numbers
    isSplitSubType = splitVals.every((s) => s.match(/^\d{1,2}$/));
  }

  return isSplitSubType ? splitVals : null;
}

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);
  if (block.classList.contains('full-width')) block.parentElement.classList.add('full-width');
  if (block.classList.contains('med-width')) block.parentElement.classList.add('med-width');
  if (block.classList.contains('small-width')) block.parentElement.classList.add('small-width');

  if (block.classList.contains('small-icons')) {
    cols[0].parentElement.classList.add('column-small-icons-container');
    cols.forEach((col) => col.classList.add(`icon-${cols.length}-cols`));
  } else if (block.classList.contains('cards')) {
    const cardsContainer = cols[0].parentElement;
    cardsContainer.classList.add('column-cards-container');
    cols.forEach((col) => {
      col.classList.add('cards-col');
      const cardWrapper = document.createElement('div');
      cardWrapper.classList.add('col-cards-wrapper');
      col.parentElement.appendChild(cardWrapper);
      cardWrapper.appendChild(col);
      const cardBorder = document.createElement('div');
      cardBorder.classList.add('cards-border');
      cardWrapper.appendChild(cardBorder);
    });
  } else if (block.classList.contains('step')) {
    cols[0].parentElement.classList.add('step-wrap');
    cols[0].classList.add('step-left');
    cols[1].classList.add('step-right');
  } else if (cols.length === 2) {
    let splitVals = null;
    [...block.classList].some((c) => {
      splitVals = findSplitSubType(c);
      return splitVals;
    });

    if (splitVals) {
      const extraSplits = splitVals.length > 2 ? 1 : 0;
      const colParent = cols[0].parentElement;

      colParent.classList.add('column-flex-container');
      let hasImage = false;
      cols.forEach((col, i) => {
        col.classList.add(`column${splitVals[i + extraSplits]}`);
        if (col.querySelector('img')) {
          col.classList.add('img-col');
          hasImage = true;
        } else col.classList.add('non-img-col');
        const button = col.querySelector('a.button');
        if (button) {
          button.classList.add('small');
          button.parentElement.classList.add('left');
        }
      });
      if (!hasImage) colParent.classList.add('columns-align-start');

      if (extraSplits) {
        // Add extra column splits for cases like: 2/5/3/2 or 4/8/4
        if (splitVals[0] !== '0') colParent.insertBefore(buildSplit(splitVals[0]), cols[0]);
        if (splitVals[3] && splitVals[3] !== '0') colParent.appendChild(buildSplit(splitVals[3]));
      }
    }
  }

  if (hasClassStartsWith(block, 'margin-')) {
    let colToUse = null;
    const classNames = [...block.classList];

    classNames.forEach((className) => {
      // Handle margins on images
      if (className.startsWith('margin-') && !className.startsWith('margin-on-col')) {
        const marginParams = getValuesFromClassName(className, 'margin-');
        let sideParamIdx = 0;
        let columnParamIdx = 2;

        let marginValue = 0;

        if (marginParams[0] === 'negative') {
          sideParamIdx = 1;
          columnParamIdx = 3;

          if (marginParams.length > 2) {
            marginValue = marginParams[2] * -1;
          }
        } else if (marginParams.length > 1) {
          [, marginValue] = marginParams;
        }

        // If the class includes an `on` param, then we can specify which column to target
        if (marginParams[columnParamIdx] != null && marginParams[columnParamIdx] === 'on') {
          const columnIdx = parseInt(marginParams[columnParamIdx + 1], 10) - 1;
          colToUse = cols[columnIdx];
        } else colToUse = cols.find((col) => col.querySelector('img'));

        if (colToUse) {
          if (marginParams[sideParamIdx] === 'top') {
            colToUse.style.marginTop = `${marginValue}px`;
          } else if (marginParams[sideParamIdx] === 'bottom') {
            colToUse.style.marginBottom = `${marginValue}px`;
          } else if (marginParams[sideParamIdx] === 'right') {
            colToUse.style.marginRight = `${marginValue}px`;
          } else if (marginParams[sideParamIdx] === 'left') {
            colToUse.style.marginLeft = `${marginValue}px`;
          }
        }
      }
    });
  }
}
