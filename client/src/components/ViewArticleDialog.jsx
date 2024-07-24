import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Button, Box, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera } from '@fortawesome/free-solid-svg-icons';

const ViewArticleDialog = ({ open, onClose, article, onEdit, onDelete, onAddToCart, user, restaurant, onImageUpload }) => (
    <Dialog open={open} onClose={onClose}>
        <DialogTitle sx={{ backgroundColor: 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Article Details
            <IconButton onClick={onClose}>
                <CloseIcon />
            </IconButton>
        </DialogTitle>
        <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box sx={{ width: '100%', marginBottom: 2, position: 'relative' }}>
                    <img src={article.img || '/default-article-image.png'} alt={article.name} style={{ width: '100%', borderRadius: '10px' }} />
                    {(user?.role === 'restaurantOwner' && user?._id === restaurant.ownerId) || user?.role === 'admin' ? (
                        <label htmlFor="upload-article-img" style={{ position: 'absolute', top: '10px', right: '10px', cursor: 'pointer' }}>
                            <FontAwesomeIcon icon={faCamera} />
                            <input
                                type="file"
                                id="upload-article-img"
                                style={{ display: 'none' }}
                                onChange={(e) => onImageUpload(e, article._id)}
                            />
                        </label>
                    ) : null}
                </Box>
                <Typography variant="h6">{article.name}</Typography>
                <Typography variant="body1">Price: {article.price}</Typography>
                <Typography variant="body1">{article.description}</Typography>
                <Typography variant="body1">Category: {article.category}</Typography>
            </Box>
        </DialogContent>
        <DialogActions>
  {user?.role !== 'restaurantOwner' && (
    <Button onClick={onAddToCart} color="primary">Add to Cart</Button>
  )}
  {(user?.role === 'restaurantOwner' && user?._id === restaurant.ownerId) || user?.role === 'admin' ? (
    <>
      <Button onClick={onEdit} color="secondary">Edit</Button>
      <Button onClick={onDelete} color="error">Delete</Button>
    </>
  ) : null}
</DialogActions>

    </Dialog>
);

export default ViewArticleDialog;
