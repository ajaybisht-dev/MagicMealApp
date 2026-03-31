import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Rating } from '@kolking/react-native-rating';

interface StarRatingComponentProps {
    rating: number;
    onChange?: (rating: number) => void;
    size?: number;
    color?: string;
    readOnly?: boolean;
    showText?: boolean;
    textColor?: string;
    totalReviews?: number;
    maxStar?: number;
}

const StarRatingComponent: React.FC<StarRatingComponentProps> = ({
    rating,
    onChange = () => { },
    size = 22,
    color = '#FFD700',
    readOnly = false,
    showText = true,
    textColor = '#333',
    totalReviews,
    maxStar
}) => {
    return (
        <View style={styles.container}>
            <Rating
                size={size}
                rating={rating}
                baseColor={"#ddd"}
                disabled={readOnly}
                fillColor={color}
                maxRating={maxStar}
            />

            {showText && (
                <Text style={[styles.text, { color: textColor }]}>
                    {`${rating?.toFixed(1)}/5`}
                    {typeof totalReviews === 'number' && ` (${totalReviews})`}
                </Text>
            )}
        </View>
    );
};

export default StarRatingComponent;

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 14,
        fontWeight: '500',
    },
});