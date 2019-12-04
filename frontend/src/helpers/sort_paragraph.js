const sortParagraph = (item1, item2) => {
  const item1Paragraph = item1.split(' ')[0];
  const item2Paragraph = item2.split(' ')[0];

  if (item1Paragraph.includes('.') && item2Paragraph.includes('.')) {
    const batches1 = item1Paragraph.split('.');
    const batches2 = item2Paragraph.split('.');

    while (batches1.length && batches2.length) {
      const par1 = parseInt(batches1.shift(), 10);
      const par2 = parseInt(batches2.shift(), 10);
      if (par1 < par2) return -1;
      if (par1 > par2) return 1;
    }

    return batches1.join('.') < batches2.join('.') ? -1 : 1;

  } else {
    return item1 < item2 ? -1 : 1;
  }
}

export default sortParagraph;