import React from "react";

import { CardContent } from "@mui/material";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";

import strings from "../../localizeStrings";

const styles = {
  subtitle: {
    color: (theme) => theme.palette.grey.dark
  },
  caption: {
    color: (theme) => theme.palette.grey.main
  }
};

const SubprojectEmptyState = () => {
  return (
    <CardContent style={{ textAlign: "center" }}>
      <List>
        <ListItem>
          <img
            src="/images-for-empty-state/subproject-table-empty-state.png"
            alt={strings.common.no_subprojects}
            width="505vw"
          />
        </ListItem>
        <ListItem>
          <Typography variant="subtitle1" style={styles.subtitle}>
            {strings.common.no_subprojects}
          </Typography>
        </ListItem>
        <ListItem>
          <Typography variant="caption" style={styles.caption}>
            {strings.common.no_items_text}
          </Typography>
        </ListItem>
      </List>
    </CardContent>
  );
};

export default SubprojectEmptyState;
