import { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import '../styles/Test.css';
import Order from '../class/order';

export default function Test() {
    const [downloadUrl, setDownloadUrl] = useState(null);
    const [fileName, setFileName] = useState('');
    const [file, setFile] = useState(null);
    const [order, setOrder] = useState(null);
    const [articleId, setArticleId] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [articleIdToRemove, setArticleIdToRemove] = useState('');

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleUpload = () => {
        if (file) {
            const formData = new FormData();
            formData.append("file", file);

            axios.post('http://localhost:5000/user/data', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            .then(response => {
                console.log('Response:', response.data);
                alert('File uploaded successfully');
                setFileName(file.name.replace('.csv', ''));
            })
            .catch(error => {
                console.error('Upload error:', error);
                alert('Error uploading file');
            });
        } else {
            alert('Please select a file to upload');
        }
    };

    const createOrder = async () => {
        try {
            const orderData = {
                orderaddress: '123 Main Street',
                orderPhone: '555-1234',
                userId: '664c600fea3bf82611450fbd',
                DeliveryPersonId: '664f0e247baafc94cf772754',
                Articles: [
                    { articleId: "6657697fcda8cf305abdcd3a", quantity: 10 }
                ]
            };

            const order = new Order(orderData);
            await new Promise(resolve => {
                const interval = setInterval(() => {
                    if (order.initialized) {
                        clearInterval(interval);
                        resolve();
                    }
                }, 100);
            });
            console.log(order);
            setOrder(order);
        } catch (error) {
            console.error('Error creating order:', error);
        }
    };

    const deleteOrder = async () => {
        if (!order) {
            console.error('No order to delete');
            return;
        }

        try {
            await order.remove();
            console.log('Order deleted successfully.');
            setOrder(null);
        } catch (error) {
            console.error('Error deleting order:', error);
        }
    };

    const addArticleToOrder = async () => {
        if (!order) {
            console.error('No order to add article to');
            return;
        }

        try {
            const result = await order.addArticle(articleId, quantity);
            console.log('Article added successfully:', result.data);
        } catch (error) {
            console.error('Error adding article to order:', error);
        }
    };

    const removeArticleFromOrder = async () => {
        if (!order) {
            console.error('No order to remove article from');
            return;
        }
        console.log(order)

        try {
            const result = await order.removeArticle(articleIdToRemove);
            console.log('Article removed successfully:', result.data);
        } catch (error) {
            console.error('Error removing article from order:', error);
        }
    };

    useEffect(() => {
        axios
            .get('http://localhost:5000/user/data')
            .then(response => {
                const fileBuffer = response.data.data[0].file.data;
                let localFileName = response.data.data[0].filename;

                if (localFileName.endsWith('.csv')) {
                    localFileName = localFileName.replace('.csv', '');
                }

                setFileName(localFileName);

                const workbook = XLSX.read(fileBuffer, { type: 'array' });
                const excelData = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
                const blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const url = URL.createObjectURL(blob);
                setDownloadUrl(url);
            })
            .catch(error => {
                console.error('Error:', error);
            });

        return () => {
            if (downloadUrl) {
                URL.revokeObjectURL(downloadUrl);
            }
        };
    }, [downloadUrl]);

    return (
        <div className="container">
            {downloadUrl && (
                <a href={downloadUrl} download={fileName} style={{ textDecoration: 'none' }}>
                    <button className="button">Download File</button>
                </a>
            )}
            <div>
                <button className="button" onClick={handleUpload}>Upload File</button>
                <button className="buttonOrder" onClick={createOrder}>Create Order</button>
                <button className="buttonDeleteOrder" onClick={deleteOrder}>Delete Order</button>
            </div>
            <input type="file" className="input-file" onChange={handleFileChange} />

            {order && (
                <div>
                    <input
                        type="text"
                        placeholder="Article ID"
                        value={articleId}
                        onChange={(e) => setArticleId(e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Quantity"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                    />
                    <button className="buttonAddArticle" onClick={addArticleToOrder}>Add Article</button>
                </div>
            )}

            {order && (
                <div>
                    <input
                        type="text"
                        placeholder="Article ID to remove"
                        value={articleIdToRemove}
                        onChange={(e) => setArticleIdToRemove(e.target.value)}
                    />
                    <button className="buttonRemoveArticle" onClick={removeArticleFromOrder}>Remove Article</button>
                </div>
            )}
        </div>
    );
}
