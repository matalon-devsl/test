import React, { useEffect, useState } from "react";
import _ from "lodash";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

import strings from "../../localizeStrings";

import JsonEditor from "./JsonEditor";

const AdditionalInfo = ({ additionalData, isAdditionalDataShown, hideAdditionalData, submitAdditionalData }) => {
  // const [initialData, setInitialData] = useState(undefined);

  const [additionalDateChange, setAdditionalDateChange] = useState({
    json: additionalData
  });
  const [isDisabled, setDisabled] = useState(true);

  console.log(isDisabled);

  useEffect(() => {
    setAdditionalDateChange({
      json: additionalData
    });
  }, [additionalData]);

  // console.log("initialData\n", initialData);
  console.log("additionalDateChange\n", additionalDateChange);

  const onChangeCallback = (content, previousContent, changeStatus) => {
    console.log("content\n", content);
    console.log("previousContent\n", previousContent);
    console.log("changeStatus\n", changeStatus);
    if (typeof previousContent.json !== "undefined" && !_.isEqual(content, previousContent)) {
      setAdditionalDateChange({
        json: content.json
      });
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  };

  return (
    <Dialog disableRestoreFocus open={isAdditionalDataShown} onClose={hideAdditionalData}>
      <DialogTitle>{strings.common.additional_data}</DialogTitle>
      <DialogContent sx={{ maxWidth: "800px" }}>
        <div>
          <JsonEditor content={additionalDateChange} onChange={onChangeCallback} />
        </div>
        {additionalDateChange === undefined && <div>{strings.common.no_resources}</div>}
      </DialogContent>
      <DialogActions>
        <Button onClick={hideAdditionalData}>{strings.common.close}</Button>
        <Button
          onClick={() => {
            submitAdditionalData(additionalDateChange.json);
            hideAdditionalData();
          }}
          disabled={isDisabled}
          data-test={`project-additional-data-submit`}
        >
          {strings.common.submit}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdditionalInfo;
