import './ImageUploader.scoped.css';
import { useState, useEffect, useRef } from 'react';
import { drawOptimizedImage } from '../../utils/image-utils';
import { useSelector } from 'react-redux';
import { apiBaseUrl } from '../../config.js';
import axios from 'axios';

import LoadingIndicator from '../../loaders/LoadingIndicator/LoadingIndicator';

const ImageUploader = () => {
    const [isUploading, setIsUploading] = useState(false);
    const [previewBgSize, setPreviewBgSize] = useState('auto');
    const [previewBgImage, setPreviewBgImage] = useState('');
    const degreesRef = useRef(0);
    const canvasRef = useRef(null);
    const imgRef = useRef(null);
    const imageFile = useSelector((state) => state.imageUploader.imageFile);
    const postId = useSelector((state) => state.creationForm.postId);
    const MAX_SIZE = { width: 800, height: 600 };

    useEffect(() => {
        imgRef.current.src = URL.createObjectURL(imageFile);
    }, []);

    const onImageLoad = () => {
        degreesRef.current = 0;
        drawOptimizedImage(canvasRef.current, imgRef.current, MAX_SIZE, degreesRef.current);
        updatePreview();
    };

    const updatePreview = () => {
        if (canvasRef.current.width < imgRef.current.clientWidth &&
            canvasRef.current.height < imgRef.current.clientHeight) {
            setPreviewBgSize('auto');
        }
        else {
            setPreviewBgSize('contain');
        }
        setPreviewBgImage(`url(${canvasRef.current.toDataURL()})`);
    };

    const rotateImage = (rotationDirection) => {
        const newDegrees = drawOptimizedImage(canvasRef.current, imgRef.current, MAX_SIZE, degreesRef.current, rotationDirection);
        degreesRef.current = newDegrees;
        updatePreview();
    };

    const uploadImage = () => {
        let formData = new FormData();
        canvas.toBlob(function (blob) {
            formData.append('image', blob);
            let url = `${apiBaseUrl}/images?postId=${postId}`;
            axios.post(url, formData)
                .then(function (response) {
                    console.log(response);
                })
                .catch(function (error) {
                    console.log(error);
                });
        }, 'image/jpeg', 1.0);
    };

    return (
        <div className="upload-preview-container">
            <div
                id='uploadPreview'
                className="upload-preview"
                style={{
                    backgroundSize: previewBgSize,
                    backgroundImage: previewBgImage,
                }}
            >
                {isUploading ? <LoadingIndicator msg='Please wait! Uploading...' /> : null}
            </div>
            <div className="upload-btn-panel">
                <div className='rotate-btns-panel'>
                    <button className="anticlockwise-btn rotate-btn" onClick={() => rotateImage('anticlockwise')}>&#8634;</button>
                    <span>Rotate</span>
                    <button className="clockwise-btn rotate-btn" onClick={() => rotateImage('clockwise')}>&#8635;</button>
                </div>
                <button className="upload-btn" onClick={uploadImage}>Upload Image</button>
            </div>
            <img ref={imgRef} onLoad={onImageLoad} style={{ display: 'none' }} />
            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
        </div>
    );
};

export default ImageUploader;